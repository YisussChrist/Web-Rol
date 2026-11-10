"""Build the Pages copy without changing source media or dropping songs."""
import concurrent.futures
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

import imageio_ffmpeg
from mutagen.mp3 import MP3
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '_site'
LIMIT = 950_000_000  # Leave room for the tar headers and below Pages' 1 GB limit.
INTERNAL = {'.github', '.agents', '.codex', 'scripts', 'docs', 'DiscordWebBot'}
TEXT_TYPES = {'.html', '.js', '.css', '.json', '.svg'}
PORTRAIT_ROOTS = {'fotos-poderes', 'Hijos'}
PORTRAIT_MAX_SIDE = 1280


def optimize_character_image(relative):
    """Keep public URLs and source files; optimize only the deployment copy."""
    target = OUTPUT / relative
    formats = {'.jpg': 'JPEG', '.jpeg': 'JPEG', '.png': 'PNG', '.webp': 'WEBP'}
    file_format = formats.get(target.suffix.lower())
    before = target.stat().st_size
    if not file_format or before < 100_000:
        return 0
    temporary = target.with_name(target.name + '.optimized')
    try:
        with Image.open(target) as original:
            if getattr(original, 'is_animated', False):
                return 0
            picture = ImageOps.exif_transpose(original)
            # A transparent PNG may have a .jpg extension. Never flatten it.
            if file_format == 'JPEG':
                if picture.convert('RGBA').getchannel('A').getextrema()[0] < 255:
                    return 0
                if picture.mode not in ('RGB', 'L', 'CMYK'):
                    picture = picture.convert('RGB')
            picture.thumbnail((PORTRAIT_MAX_SIDE, PORTRAIT_MAX_SIDE), Image.Resampling.LANCZOS)
            options = {'icc_profile': picture.info.get('icc_profile', b'')}
            if picture.getexif():
                options['exif'] = picture.getexif().tobytes()
            if file_format == 'JPEG':
                options.update(quality=90, optimize=True, progressive=True)
            elif file_format == 'WEBP':
                options.update(quality=90, method=4)
            else:
                options.update(optimize=True)
            picture.save(temporary, format=file_format, **options)
            with Image.open(temporary) as encoded:
                encoded.load()
                if encoded.size != picture.size or encoded.format != file_format:
                    raise RuntimeError(f'Portrait validation failed: {relative}')
                if file_format == 'PNG' and encoded.convert('RGBA').tobytes() != picture.convert('RGBA').tobytes():
                    raise RuntimeError(f'PNG pixels changed during encoding: {relative}')
                if file_format == 'WEBP' and encoded.convert('RGBA').getchannel('A').tobytes() != picture.convert('RGBA').getchannel('A').tobytes():
                    raise RuntimeError(f'Portrait transparency changed: {relative}')
        saved = before - temporary.stat().st_size
        if saved > 0:
            os.replace(temporary, target)
            return saved
        return 0
    finally:
        temporary.unlink(missing_ok=True)


def optimize_character_images(files):
    portraits = [path for path in files if path.parts[0] in PORTRAIT_ROOTS
                 and path.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'}]
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, os.cpu_count() or 2)) as pool:
        savings = list(pool.map(optimize_character_image, portraits))
    result = {'files': sum(saved > 0 for saved in savings), 'saved_bytes': sum(savings),
              'max_side': PORTRAIT_MAX_SIDE, 'jpeg_webp_quality': 90}
    print(f'Optimized {result["files"]} character images; saved {result["saved_bytes"] / 1e6:.1f} MB. Original URLs retained.', flush=True)
    return result


def public_files():
    names = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode('utf-8').split('\0')
    return [Path(name) for name in names if name and Path(name).parts[0] not in INTERNAL
            and not any('backup-before-' in part for part in Path(name).parts)
            and not Path(name).name.startswith('.') and (ROOT / name).is_file()]


def compress_audio(relative):
    original, target = ROOT / relative, OUTPUT / relative
    info = MP3(original).info
    # Files already at/below the target are copied unchanged, never upsampled.
    if info.bitrate <= 135_000:
        return False
    temporary = target.with_suffix('.encoded.mp3')
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-nostdin', '-hide_banner', '-loglevel', 'error',
                    '-y', '-i', str(original), '-map', '0:a:0', '-map_metadata', '0',
                    '-c:a', 'libmp3lame', '-b:a', '128k', '-id3v2_version', '3', str(temporary)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    encoded = MP3(temporary).info
    if abs(encoded.length - info.length) > 0.25 or encoded.channels != info.channels:
        raise RuntimeError(f'Audio validation failed: {relative}')
    if temporary.stat().st_size < target.stat().st_size:
        os.replace(temporary, target)
        return True
    temporary.unlink()
    return False


def optimize_images(files):
    # These libraries declare their artwork as literal img/... paths. Rewrite
    # those declarations only; leave assets with any other consumer untouched.
    texts = {path: (ROOT / path).read_text(encoding='utf-8') for path in files if path.suffix in TEXT_TYPES}
    converted = {}
    for data_path in [Path('OST/data.js'), Path('Pokemon/EtruriaRadio/data.js')]:
        content = texts[data_path]
        names = set(re.findall(r'[\'\"](img/[^\'\"]+\.png)[\'\"]', content))
        for name in sorted(names):
            relative = data_path.parent / name
            original = ROOT / relative
            if not original.is_file():
                continue  # Existing absent artwork is outside the build's scope.
            if any(Path(name).name in value for path, value in texts.items() if path != data_path):
                continue
            target = (OUTPUT / relative).with_suffix('.webp')
            if (ROOT / relative.with_suffix('.webp')).exists():
                continue
            with Image.open(original) as picture:
                if getattr(picture, 'is_animated', False):
                    continue
                picture.save(target, format='WEBP', lossless=True, exact=True, method=4,
                             icc_profile=picture.info.get('icc_profile', b''))
                with Image.open(target) as encoded:
                    if encoded.size != picture.size or encoded.convert('RGBA').tobytes() != picture.convert('RGBA').tobytes():
                        raise RuntimeError(f'Image validation failed: {relative}')
            if target.stat().st_size >= original.stat().st_size:
                target.unlink()
                continue
            content = content.replace(name, str(Path(name).with_suffix('.webp')).replace('\\', '/'))
            (OUTPUT / relative).unlink()
            converted[relative.as_posix()] = relative.with_suffix('.webp').as_posix()
        (OUTPUT / data_path).write_text(content, encoding='utf-8')
    return converted


def version_assets(files, version):
    # Fresh HTML loads the matching scripts/styles after every deployment.
    pattern = re.compile(r'(?P<attr>\b(?:src|href)=)(?P<q>[\'\"])(?P<url>[^\'\"]+\.(?:js|css)(?:\?[^\'\"]*)?)(?P=q)')
    def update(match):
        url = match['url']
        if re.match(r'^(?:[a-z]+:|//)', url):
            return match[0]
        url = url.split('?')[0] + '?v=' + version
        return match['attr'] + match['q'] + url + match['q']
    for path in files:
        if path.suffix == '.html':
            target = OUTPUT / path
            target.write_text(pattern.sub(update, target.read_text(encoding='utf-8')), encoding='utf-8')


def build():
    # Refuse to overwrite any previous build or user directory.
    OUTPUT.mkdir(exist_ok=False)
    files = public_files()
    initial = sum((ROOT / path).stat().st_size for path in files)
    for path in files:
        target = OUTPUT / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / path, target)
    print(f'Copied {len(files)} public files ({initial / 1e6:.1f} MB).', flush=True)
    audio = [path for path in files if path.suffix.lower() == '.mp3']
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, os.cpu_count() or 2)) as pool:
        compressed = 0
        for count, changed in enumerate(pool.map(compress_audio, audio), 1):
            compressed += changed
            if count % 10 == 0:
                print(f'Validated audio: {count}/{len(audio)}', flush=True)
    converted = optimize_images(files)
    portraits = optimize_character_images(files)
    print(f'Optimized {compressed} audio files and {len(converted)} lossless images.', flush=True)
    version = subprocess.check_output(['git', 'rev-parse', '--short=12', 'HEAD'], cwd=ROOT).decode().strip()
    version_assets(files, version)
    (OUTPUT / '.nojekyll').touch()
    # Every public source must still have a corresponding deployed file.
    for path in files:
        deployed = OUTPUT / converted.get(path.as_posix(), path.as_posix())
        if not deployed.is_file():
            raise RuntimeError(f'Missing deployed asset: {path}')
    total = sum(path.stat().st_size for path in OUTPUT.rglob('*') if path.is_file())
    report = {'commit': version, 'source_bytes': initial, 'deployed_bytes': total,
              'limit_bytes': LIMIT, 'audio_files': len(audio), 'compressed_audio': compressed,
              'lossless_images': converted, 'character_images': portraits}
    (OUTPUT / '_build-info.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Pages payload: {initial / 1e6:.1f} -> {total / 1e6:.1f} MB (limit {LIMIT / 1e6:.0f} MB).', flush=True)
    if total >= LIMIT:
        raise RuntimeError('Site exceeds the deployment budget; nothing will be published.')
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as summary:
            summary.write(f'### Pages size check\n\n{initial / 1e6:.1f} → **{total / 1e6:.1f} MB**. '
                          f'All {len(audio)} songs retained. {len(converted)} images converted losslessly. '
                          f'{portraits["files"]} character images optimized (up to {PORTRAIT_MAX_SIDE}px, JPEG/WebP quality 90); original URLs and source images retained.\n')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    build()

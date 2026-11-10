"""Regression checks for public portrait optimization; source media is untouched."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

from PIL import Image, ImageOps

spec = importlib.util.spec_from_file_location('pages', Path(__file__).with_name('build-pages.py'))
pages = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pages)


class PortraitTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.previous_output = pages.OUTPUT
        pages.OUTPUT = Path(self.directory.name)
        self.addCleanup(setattr, pages, 'OUTPUT', self.previous_output)
        (pages.OUTPUT / 'fotos-poderes').mkdir()

    def path(self, name):
        return pages.OUTPUT / 'fotos-poderes' / name

    def test_disguised_png_becomes_jpeg_at_same_url(self):
        path = self.path('Freyja.jpg')
        image = Image.effect_noise((1600, 1400), 80).convert('RGB')
        image.save(path, format='PNG')
        original_size = path.stat().st_size
        saved = pages.optimize_character_image(path.relative_to(pages.OUTPUT))
        self.assertGreater(saved, 0)
        self.assertEqual(path.stat().st_size, original_size - saved)
        with Image.open(path) as result:
            self.assertEqual(result.format, 'JPEG')
            self.assertEqual(max(result.size), 1280)

    def test_png_transparency_and_pixels_match_resized_image(self):
        path = self.path('Alpha.png')
        picture = Image.effect_noise((1536, 1400), 80).convert('RGBA')
        picture.putalpha(Image.linear_gradient('L').resize(picture.size))
        picture.save(path, compress_level=0)
        picture.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
        self.assertGreater(pages.optimize_character_image(path.relative_to(pages.OUTPUT)), 0)
        with Image.open(path) as result:
            self.assertEqual(result.convert('RGBA').tobytes(), picture.tobytes())

    def test_transparent_disguised_jpeg_is_not_flattened(self):
        path = self.path('Transparent.jpg')
        picture = Image.effect_noise((700, 700), 80).convert('RGBA')
        picture.putalpha(120)
        picture.save(path, format='PNG')
        original = path.read_bytes()
        self.assertEqual(pages.optimize_character_image(path.relative_to(pages.OUTPUT)), 0)
        self.assertEqual(path.read_bytes(), original)

    def test_webp_transparency_is_retained(self):
        path = self.path('Alpha.webp')
        picture = Image.effect_noise((800, 800), 80).convert('RGBA')
        picture.putalpha(Image.linear_gradient('L').resize(picture.size))
        picture.save(path, format='PNG', compress_level=0)
        self.assertGreater(pages.optimize_character_image(path.relative_to(pages.OUTPUT)), 0)
        with Image.open(path) as result:
            self.assertEqual(result.format, 'WEBP')
            self.assertEqual(result.convert('RGBA').getchannel('A').tobytes(), picture.getchannel('A').tobytes())

    def test_animation_and_small_images_unchanged(self):
        path = self.path('Animation.png')
        first = Image.effect_noise((600, 600), 80).convert('RGB')
        second = ImageOps.invert(first)
        first.save(path, save_all=True, append_images=[second], duration=100, loop=0)
        original = path.read_bytes()
        self.assertEqual(pages.optimize_character_image(path.relative_to(pages.OUTPUT)), 0)
        self.assertEqual(path.read_bytes(), original)
        small = self.path('Small.jpg')
        Image.new('RGB', (20, 20), 'red').save(small)
        original = small.read_bytes()
        self.assertEqual(pages.optimize_character_image(small.relative_to(pages.OUTPUT)), 0)
        self.assertEqual(small.read_bytes(), original)

    def test_orientation_is_applied_before_resize(self):
        path = self.path('Rotated.jpg')
        image = Image.effect_noise((1600, 1000), 80).convert('RGB')
        exif = Image.Exif()
        exif[274] = 6
        image.save(path, quality=100, exif=exif)
        pages.optimize_character_image(path.relative_to(pages.OUTPUT))
        with Image.open(path) as result:
            self.assertEqual(result.size, (800, 1280))
            self.assertNotIn(274, result.getexif())


if __name__ == '__main__':
    unittest.main()

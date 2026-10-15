# EstateHub landing page

The product page for EstateHub. Plain HTML, CSS and JavaScript with no build step, so GitHub Pages can serve the repository as it is.

## Preview locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

## Set the demo and purchase links

Edit `assets/js/config.js`:

- `demo` is the live demo URL.
- `CODECANYON_ITEM_ID` is the numeric ID Envato gives the item on approval. The purchase link is built from it and the item slug (`estatehub-aipowered-real-estate-marketplace-property-management-platform`). If the title changes, update `CODECANYON_SLUG` to match the item page URL.
- `custom` is where "Request a quote" points.

The "Live demo" button appears in the header, the hero, the closing band and the purchase bar on phones. The other "Buy" buttons scroll to the pricing section, where the Regular and Extended buttons open the CodeCanyon item. While a link is empty its buttons are still shown but do not navigate, so set them all before publishing.

## Deploy to GitHub Pages

1. Create a public repository on GitHub and push this folder to `main`.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then `main` and `/ (root)`.

The site is published at `https://<user>.github.io/<repository>/`. All asset paths are relative, so it works from that sub-path and from a custom domain.

Once the final URL is known, change `og:image` in `index.html` to the full address of `assets/img/og.jpg`. Social networks do not resolve a relative path.

## Structure

```text
index.html              Page markup and copy
assets/css/styles.css   Styles, including the light and dark colour tokens
assets/js/config.js     Demo and purchase URLs
assets/js/main.js       Theme switch, screens, viewer, compare slider, purchase bar
assets/img/screens/     Product screenshots (WebP)
assets/img/og.jpg       Social preview image
assets/video/           Product tour (MP4), its poster frame and captions
```

## Screenshots

Each screenshot is exported at two widths, `-960` and `-1920`. Seller and admin screens also come in `-light` and `-dark`, and the page swaps them with the theme.

To replace one, export the new image at the same size and file name. To add a screen to the showcase, add a `<button class="screen-btn">` to the right panel in `index.html`:

```html
<li><button type="button" class="screen-btn"
  data-shot="admin-reviews"
  data-path="/admin/reviews"
  data-caption="Moderate customer reviews.">Reviews</button></li>
```

`data-shot` is the file name without the theme and width. Panels marked `data-themed` expect both a light and a dark file.

## Product tour video

"Watch the tour" in the hero opens `assets/video/estatehub-tour.mp4` in a dialog. The file is only downloaded when a visitor opens it.

The video is built in the sibling `estatehub-video` folder. To change the narration or a scene, edit `script.json` there and run `npm run build`. To use a recorded voice, save one file per scene as `audio/<scene id>.wav` (`.mp3` and `.m4a` also work); the build uses a recording where one exists and the system voice otherwise, and retimes the scene to fit. The narration in the published video comes from Kokoro, an open-source voice model (Apache 2.0) that runs locally: `npm run speak` in `estatehub-video` regenerates `audio/<scene id>.wav` from `script.json`. `npm run voice` does the same with ElevenLabs once `ELEVENLABS_API_KEY` is set in `estatehub-video/.env`.

Without those files the build falls back to the macOS system voice. Apple licenses that voice for personal use only, so do not publish a build that used it.

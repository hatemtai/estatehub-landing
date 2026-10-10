# EstateHub landing page

The product page for EstateHub. Plain HTML, CSS and JavaScript with no build step, so GitHub Pages can serve the repository as it is.

## Preview locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

## Set the demo and purchase links

Edit `assets/js/config.js`:

```js
window.ESTATEHUB_LINKS = {
  demo: "https://demo.example.com",
  purchase: "https://codecanyon.net/item/...",
};
```

A button is shown only when its URL is filled in. With both empty, the page shows no "Live demo" or "Buy" buttons and hides the closing call-to-action band.

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
assets/js/main.js       Theme switch, screen showcase, viewer, compare slider
assets/img/screens/     Product screenshots (WebP)
assets/img/og.jpg       Social preview image
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

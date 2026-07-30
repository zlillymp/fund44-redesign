Fund44 logo assets — v1

logo
  fund44-logo-primary.png        primary lockup, cream background (1893x414)
  fund44-logo-on-ink.png         primary lockup on ink
  fund44-logo-mono-ink.png       one-color ink, no plate
  fund44-logo-mono-white.png     one-color knockout on ink

icons
  fund44-icon-512.png            app / PWA icon
  fund44-apple-touch-icon-180.png
  fund44-favicon-64.png
  fund44-favicon-32.png
  fund44-favicon-16.png

social
  fund44-og-1200x630.png         Open Graph / Twitter card

For the site header, do NOT use a PNG — render the logo as live text so it
stays crisp at every density. Snippet:

<a href="/" class="f44-logo">fund<span>44</span></a>

.f44-logo {
  font-family: Figtree, sans-serif; font-weight: 800; font-size: 20px;
  letter-spacing: -.045em; line-height: 1; color: #0E0E0C;
  text-decoration: none; display: inline-flex; align-items: baseline;
  background: #fff; border: 1px solid #0E0E0C;
  border-radius: .34em; padding: .26em .4em;
}
.f44-logo span {
  font-size: .86em; letter-spacing: -.05em; color: #C6ED3C;
  -webkit-text-stroke: .04em #0E0E0C; paint-order: stroke fill;
}

Font: Figtree ExtraBold (800), Google Fonts, SIL Open Font License.
Colors: ink #0E0E0C · lime #C6ED3C · lime deep #8FB616 · cream #F7F6F1 · white #FFFFFF
Minimum size: 16px. Below that use the square icon.
Clear space: the height of the lowercase "d" on all four sides.

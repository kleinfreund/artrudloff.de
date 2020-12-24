# artrudloff

This is the repository for the portfolio site of the artists Anke and Andreas Rudloff. Hosted on [Uberspace](https://uberspace.de) and built with [Eleventy](https://11ty.dev).

## Image processing

**Convert .tiff images to .jpg**:

```sh
convert *.tiff -set filename: "%t" %[filename:].jpg
```

**Resize images**:

```sh
mogrify -resize 1000x1500 *.jpg
```

**Compress images**:

```sh
mogrify -strip -interlace Plane -quality 75% *.jpg
```

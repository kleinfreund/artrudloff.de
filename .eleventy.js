const path = require('path');
const fs = require('fs');

const CleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier');

// https://github.com/kangax/html-minifier#options-quick-reference
const htmlMinifierOptions = {
  useShortDoctype: true,
  removeComments: true,
  collapseWhitespace: true
};

module.exports = function (eleventyConfig) {
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
    strict_filters: true
  });

  eleventyConfig.setDataDeepMerge(true);

  // Copies static files to the output directory
  eleventyConfig
    .addPassthroughCopy('src/img')
    .addPassthroughCopy('src/css')
    .addPassthroughCopy('src/js')
    .addPassthroughCopy('src/favicon.ico')
    .addPassthroughCopy('src/.htaccess');

  // Filter for compressing CSS
  eleventyConfig.addFilter('resolve_css_imports', resolveCssImports);
  eleventyConfig.addFilter('minify_css', minifyCss);

  // Compresses output HTML
  if (process.env.ELEVENTY_ENV === 'production') {
    eleventyConfig.addTransform('minify_html', minifyHtml);
  }

  if (process.env.ELEVENTY_ENV !== 'production') {
    eleventyConfig.addFilter('dump', function (value) {
      try {
        console.log(JSON.stringify(value, null, 2))
      } catch { }
      return require('util').inspect(value);
    });
  }

  return {
    dir: {
      input: 'src',
      // Make the project directory the includes directory. This allows me to include files from
      // across the project instead of just a dedicated includes directory.
      includes: ''
    },
    templateFormats: ['md', 'liquid', 'html']
  };
};


/**
 * @param {string} mainCssPath
 * @returns {string}
 */
function resolveCssImports(mainCssPath) {
  const mainCssContent = fs.readFileSync(path.join('src', mainCssPath), 'utf8');
  const importRules = mainCssContent.split('\n').filter(line => line.startsWith('@import'));
  const importPaths = importRules.map(importRule => {
    return path.join('src', importRule.replace('@import \'', '').replace('\';', ''));
  });

  let concatenatedCssContent = '';
  for (const importPath of importPaths) {
    concatenatedCssContent += fs.readFileSync(importPath, 'utf8');
  }

  return concatenatedCssContent;
}

/**
 * Minifies CSS content.
 *
 * @param {string} concatenatedCssContent
 * @returns {string} the minified CSS content
 */
function minifyCss(concatenatedCssContent) {
  const minifyResult = new CleanCSS().minify(concatenatedCssContent);

  if (minifyResult.errors.length > 0) {
    console.error('❌ Could not minify CSS.');
    minifyResult.errors.forEach(error => { console.error('❌', error) });

    return concatenatedCssContent;
  }

  return minifyResult.styles;
}

/**
 * Minifies HTML content.
 *
 * @param {string} content
 * @param {string} outputPath
 * @returns {string} the minified HTML content
 */
function minifyHtml(content, outputPath) {
  if (outputPath.endsWith('.html')) {
    return htmlMinifier.minify(content, htmlMinifierOptions);
  }

  return content;
}

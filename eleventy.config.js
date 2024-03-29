const { minify } = require('terser')
const CleanCSS = require('clean-css')
const fs = require('fs')
const htmlMinifier = require('html-minifier')
const path = require('path')

/**
 * https://github.com/kangax/html-minifier#options-quick-reference
 *
 * @type {import('html-minifier').Options}
 */
const htmlMinifierOptions = {
	useShortDoctype: true,
	removeComments: true,
	collapseWhitespace: true
}

module.exports = function (eleventyConfig) {
	eleventyConfig.setLiquidOptions({
		dynamicPartials: true,
		strict_filters: true
	})

	eleventyConfig.setDataDeepMerge(true)

	// Copies static files to the output directory
	eleventyConfig
		.addPassthroughCopy('src/img')
		.addPassthroughCopy('src/css')
		.addPassthroughCopy('src/js')
		.addPassthroughCopy('src/favicon.ico')
		.addPassthroughCopy('src/.htaccess')

	// Filter for compressing CSS/JS
	eleventyConfig.addFilter('resolve_css_imports', resolveCssImports)
	eleventyConfig.addFilter('minify_css', minifyCss)
	eleventyConfig.addFilter('minify_js', minifyJs)

	// Compresses output HTML
	if (process.env.NODE_ENV === 'production') {
		eleventyConfig.addTransform('minify_html', minifyHtml)
	}

	if (process.env.NODE_ENV !== 'production') {
		// Log and print template data
		eleventyConfig.addFilter('log', function (value) {
			try {
				console.log(JSON.stringify(value, null, 2))
			} catch { }

			return require('util').inspect(value)
		})
	}

	return {
		dir: {
			input: 'src',
			// Make the project directory the includes directory. This allows me to include files from
			// across the project instead of just a dedicated includes directory.
			includes: ''
		},
		templateFormats: ['md', 'liquid', 'html']
	}
}

/**
 * @param {string} cssPath
 * @returns {string} the concatenated contents of the CSS files found by resolving `@import` rules in the CSS file at `cssPath`.
 */
function resolveCssImports(cssPath) {
	return fs.readFileSync(path.resolve(__dirname, path.join('src', cssPath)), 'utf8')
		.split(/\r?\n/)
		.filter((line) => line.startsWith('@import'))
		.map((rule) => rule.replace(/@import ['"]/, '').replace(/['"];/, ''))
		.map((importPath) => fs.readFileSync(path.resolve(__dirname, path.join('src', importPath)), 'utf8'))
		.join('')
}

/**
 * Minifies CSS content.
 *
 * @param {string} concatenatedCssContent
 * @returns {string} the minified CSS content
 */
function minifyCss(concatenatedCssContent) {
	const minifyResult = new CleanCSS().minify(concatenatedCssContent)

	if (minifyResult.errors.length > 0) {
		console.error('❌ Could not minify CSS.')

		for (const error of minifyResult.errors) {
			console.error('❌', error)
		}

		return concatenatedCssContent
	}

	return minifyResult.styles
}

/**
 * Minifies HTML content.
 *
 * @param {string} content
 * @param {string} outputPath
 * @returns {string} the minified HTML content
 */
function minifyHtml(content, outputPath) {
	return outputPath.endsWith('.html')
		? htmlMinifier.minify(content, htmlMinifierOptions)
		: content
}

/**
 * @param {string} content
 * @returns {Promise<string>}
 */
async function minifyJs(content) {
	try {
		const result = await minify(content, { mangle: { toplevel: true } })
		return result.code ?? ''
	} catch (error) {
		console.error('❌', error)
		return ''
	}
}

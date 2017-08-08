/**
 * Parse a URL and return its components.
 *
 * @param {String} url           The URL to parse.
 * @param {String} component     Specify one of 'URL_SCHEME', 'URL_HOST', 'URL_PORT', 'URL_USER', 'URL_PASS', 'URL_PATH', 'URL_QUERY' or 'URL_FRAGMENT' to retrieve just a specific URL component as a string.
 * @param {String} mode          Specify one of 'php', 'strict' or 'loose' to set the parsing mode.
 *
 * @return {Mixed}
 */
function parseURL(url, component, mode) {
    var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
            'relative', 'path', 'directory', 'file', 'query', 'fragment'],
        mode = mode || 'php',
        parser = {
            php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
        };

    var m = parser[mode].exec(url),
        uri = {},
        i = 14;
    while (i--) {
        if (m[i]) {
            uri[key[i]] = m[i];
        }
    }

    if (component) {
        return uri[component.replace('URL_', '').toLowerCase()];
    }
    if (mode !== 'php') {
        var name = 'queryKey';
        parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
        uri[name] = {};
        query = uri[key[12]] || '';
        query.replace(parser, function ($0, $1, $2) {
            if ($1) {uri[name][$1] = $2;}
        });
    }
    uri.source = null;
    return uri;
};


/**
 * Gets the absolute URI.
 *
 * @param {String} href     The relative URL.
 * @param {String} base     The base URL.
 *
 * @return {String}         The absolute URL.
 */
function getAbsoluteUrl(href, base) {// RFC 3986
    function removeDotSegments(input) {
        var output = [];
        input.replace(/^(\.\.?(\/|$))+/, '')
            .replace(/\/(\.(\/|$))+/g, '/')
            .replace(/\/\.\.$/, '/../')
            .replace(/\/?[^\/]*/g, function (p) {
                if (p === '/..') {
                    output.pop();
                } else {
                    push.call(output, p);
                }
            });
        return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
    }

    function URIComponents(url) {
        var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
        // authority = '//' + user + ':' + pass '@' + hostname + ':' port
        return (m ? {
            href     : m[0] || '',
            protocol : m[1] || '',
            authority: m[2] || '',
            host     : m[3] || '',
            hostname : m[4] || '',
            port     : m[5] || '',
            pathname : m[6] || '',
            search   : m[7] || '',
            hash     : m[8] || ''
        } : null);
    }

    href = URIComponents(href || '');
    base = URIComponents(base || window.location.href);

    return !href || !base ? null : (href.protocol || base.protocol) +
    (href.protocol || href.authority ? href.authority : base.authority) +
    removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
    (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
    href.hash;
};

/**
 * Increase/Decrease the lightness of a color in the hex color format by an absolute amount.
 *
 * @param {String} color      The string of the specified color.
 * @param {Number} amount     The percentage 0-100.
 *
 * @return {String}           The lighten or darken color in hex color format.
 */
function lightenDarkenColor(color, amount) {
    var usePound = false;

    if (color[0] == "#") {
        color = color.slice(1);
        usePound = true;
    }

    var num = parseInt(color, 16);

    var r = (num >> 16) + amount;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amount;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + amount;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
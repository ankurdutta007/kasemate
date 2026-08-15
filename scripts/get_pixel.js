const fs = require('fs');
// Very naive hack for PNG files if not using a library.
// But we have Node. We can just use an HTML canvas if we were in browser.
// Without an external library, we can't easily parse PNG in plain node.
// However, since it's a Mac, I can use `sips`!
// sips doesn't output pixel values directly. 
// Let's use python!

// fetch solc binary -> fetch bundler -> automatic bundling emitting solc window -> solc ready to be used.
const wrapper = require('solc/wrapper')
var solc = wrapper(self.Module);
self.solc = solc;
import {analyzeInterference, analyzeThickness} from './analysis.js';
self.onmessage = ({data}) => {
  try {
    const progress = value => self.postMessage({progress: value});
    const operation = data.type === 'interference' ? analyzeInterference : data.type === 'thickness' ? analyzeThickness : null;
    if (!operation) throw Error('Unsupported analysis operation');
    self.postMessage({result: operation(data.items, {...data.options, progress})});
  } catch (error) { self.postMessage({error: error.message}); }
};

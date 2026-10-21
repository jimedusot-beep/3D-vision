// A terminated worker cannot continue consuming a mobile device's CPU.
export async function workerTask(worker, message, {cancel, progress, timeout = 20000} = {}) {
  let timer;
  try {
    return await new Promise((resolve, reject) => {
      cancel?.(() => reject(Error('Operation cancelled. The assembly was not changed.')));
      timer = setTimeout(() => reject(Error('Operation exceeded 20 seconds. Select fewer parts or simplify the meshes.')), timeout);
      worker.onmessage = ({data}) => {
        if (data.error) reject(Error(data.error));
        else if ('progress' in data) progress?.(data.progress);
        else resolve(data.result ?? data.geometry);
      };
      worker.onerror = e => reject(Error(e.message || 'Geometry worker failed'));
      worker.postMessage(message);
    });
  } finally { clearTimeout(timer); cancel?.(null); worker.terminate(); }
}

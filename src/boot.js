import('./main.js').catch(async error=>{
 const {startFileMode}=await import('./file-mode.js');
 await startFileMode(error);
});

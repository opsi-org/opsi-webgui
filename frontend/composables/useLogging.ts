export const log = () => {
  function log (...msg: any) { console.log(...msg) }
  function debug (...msg: any) { console.debug(...msg) }
  function info (...msg: any) { console.info(...msg) }
  function warn (...msg: any) { console.warn(...msg) }
  function error (...msg: any) { console.error(...msg) }

  function log_colored (color: string, ...msg:any) {
    // const [first, ...rest] = msg
    const s =  "" + msg.map((v: any)=> v ).join(" ")
    console.log("%c"+s, "color:" + color + ";font-weight:bold;");
  }
  function log_colored_group (color: string, ...msg:any) {
    const s =  "" + msg.map((v: string)=>{return v}).join(" ")
    console.group("%c"+s, "color:" + color + ";font-weight:bold;");
  }
  function log_colored_group_end () {
    console.groupEnd()
  }

  // colorTrace("Test Me", "red");
  return { log, debug, info, warn, error, log_colored,
            log_colored_group, log_colored_group_end }
}
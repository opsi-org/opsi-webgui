export function makeToast (
  vm: {
    $bvToast:
    {
      toast: (arg0: string, arg1:
        { title: string; toaster: string; variant: string; autoHideDelay: number; appendToast: boolean; }) => void;
    };
  },
  message: string = '', title: string = '', variant: string = 'primary',
  autoHideDelay: number = 6000, append = false): void {
  vm.$bvToast.toast(message, {
    // id: 'MakeToast', // MakeToast__toast_outer
    title,
    toaster: 'b-toaster-bottom-right',
    variant,
    autoHideDelay,
    appendToast: append
  })
}
export default {
  makeToast
}
// '{ id: string; title: string; toaster: string; variant: string; autoHideDelay: number; appendToast: boolean; }' is not assignable to parameter of type
// '{             title: string; toaster: string; variant: string; autoHideDelay: number; appendToast: boolean; }'.
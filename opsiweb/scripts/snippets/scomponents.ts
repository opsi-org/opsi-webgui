export function makeToast (
  vm: {
    $bvToast:
    {
      toast: (arg0: string, arg1:
        { title: string; toaster: string; variant: string; autoHideDelay: number; appendToast: boolean; }) => void;
    };
  },
  message: string = '', title: string = '', variant: string = 'primary',
  autoHideDelay: number = 5000, append = false): void {
  vm.$bvToast.toast(message, {
    title,
    toaster: 'b-toaster-bottom-right',
    variant,
    autoHideDelay,
    appendToast: append
  })
}

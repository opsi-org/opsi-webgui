export default {
  title: 'Div/D Scroll Result',
  parameters: { docs: { description: { component: 'Scrollable Content Div' } } }
}

const DefaultVisibleTemplate = (_args, { argTypes }) => ({
  props: Object.keys(argTypes),
  template: `<DivDScrollResult style="max-height: 50px !important">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nisi sem, placerat nec felis eu, facilisis pulvinar neque. Nullam at ligula tellus. Phasellus consequat accumsan nulla porta molestie. Praesent mollis dignissim nisl, vel vestibulum metus tristique vel. Duis sed ultrices metus. Pellentesque rhoncus tempus massa ac mattis. Phasellus fermentum, risus sit amet cursus venenatis, metus lorem lacinia nisl, vitae porta nulla quam rutrum odio. Vivamus mattis lectus vitae risus aliquam, et accumsan eros mollis. Fusce massa dui, molestie eu tortor eget, luctus rutrum lorem. Pellentesque varius justo lacus, eget vestibulum metus porta vitae. Mauris aliquam purus imperdiet quam faucibus, non luctus magna pretium. Vivamus ligula leo, auctor non massa a, auctor sagittis quam. Aliquam erat volutpat. In turpis lacus, scelerisque eget consectetur a, mollis in dolor. Mauris hendrerit dui in felis elementum, eget porttitor libero hendrerit.

      Curabitur venenatis hendrerit quam, ut dictum ex consectetur in. Pellentesque id metus ac turpis ornare cursus. Sed faucibus dolor ligula, vitae gravida libero pulvinar eu. In venenatis dolor felis, eu commodo velit luctus nec. Maecenas a elit aliquet, fringilla sapien sit amet, sagittis mi. Integer nec faucibus lacus. Sed mollis sit amet arcu nec eleifend.

      Curabitur congue felis dui, sed pulvinar felis ornare nec. Suspendisse accumsan, diam quis feugiat placerat, sapien ligula aliquet enim, et pellentesque massa velit vitae nunc. Proin hendrerit mattis ipsum, vitae efficitur nibh eleifend at. Integer volutpat, ligula non porttitor pharetra, ligula mi tempor lacus, in euismod odio enim vestibulum ex. Praesent auctor urna at maximus cursus. Morbi porta urna massa, vitae egestas erat convallis sit amet. Aenean accumsan in quam ut pharetra. Nam felis felis, elementum sed mi nec, pretium consectetur justo. Quisque sapien dolor, viverra vitae commodo laoreet, consequat vitae nulla. Maecenas gravida pharetra velit non vestibulum.

      Nulla laoreet lorem dolor, a ultrices nunc sollicitudin sit amet. Sed volutpat hendrerit elit, at cursus diam porttitor eget. Sed ante magna, luctus a molestie eu, maximus quis turpis. Phasellus dignissim dui ullamcorper rhoncus iaculis. Aliquam eget sem elit. Cras at semper nisl, quis lacinia nisl. Aenean venenatis sagittis tempus. Aenean non tincidunt augue. Duis blandit mattis arcu, non mollis libero venenatis ut. Mauris id pellentesque purus, sit amet cursus nibh. Morbi efficitur mauris eget ornare porta. Donec lacinia, urna in pulvinar dapibus, nunc purus malesuada ex, ultricies varius ligula dui at enim. Cras sit amet rhoncus orci, quis mattis metus.

      Morbi quam nunc, aliquam sit amet luctus quis, vulputate id dui. Vestibulum est dui, pretium eu dolor ac, sodales lacinia neque. Cras aliquet dapibus nisl, eu efficitur nisi molestie suscipit. Maecenas placerat sed leo ac fringilla. Integer est arcu, volutpat at magna sit amet, pharetra rutrum ipsum. Donec sit amet gravida sapien. Vestibulum vel sagittis massa. Pellentesque malesuada libero ut nulla tempus, nec lobortis lectus aliquet. Quisque pretium sem diam, at tincidunt mi fringilla non. Cras convallis iaculis pellentesque. Aliquam eget gravida ex. Duis ut posuere purus, a facilisis elit. Ut scelerisque mauris ac sollicitudin semper. Vestibulum quis tellus quis ante dignissim aliquet. Cras consectetur quam eget molestie efficitur.
    </DivDScrollResult>
    `
})

export const DScrollResult = DefaultVisibleTemplate.bind({})

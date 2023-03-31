const disableInputMixin = {
  beforeUpdate() {
    const inputElements = this.$el.querySelectorAll('el-input');
    console.log(inputElements.length)
    for (let i = 0; i < inputElements.length; i++) {
      inputElements[i].setAttribute('disabled', 'disabled');
    }
  }
};
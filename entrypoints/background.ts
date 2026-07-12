export default defineBackground(() => {
  console.log("PromptPen background service worker loaded.", {
    id: browser.runtime.id,
  })
})

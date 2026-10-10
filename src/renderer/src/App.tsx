import Bubble from './components/Bubble'

function App(): React.JSX.Element {
  //const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <Bubble />
    </>
  )
}

export default App

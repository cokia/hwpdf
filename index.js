// document.getElementsByTagName('label').map(label => label.addEventListener(ev => ev.preventDefault()))

const createLoader = () => {
  const loader = document.createElement('div')
  loader.id = 'loader'
  return loader
}

let loader = createLoader()

const fileSelector = document.getElementById('selector')
const workingon = document.getElementById('workingon')
const loadButton = document.getElementById('load')

fileSelector.addEventListener('change', () => {
  fileSelector.after(loader)
  loadButton.remove()
  renderHWP(fileSelector.files[0]).then(url => {
    loader.remove()
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.classList.add('button')
    a.appendChild(document.createTextNode('다운로드가 시작되지 않았으면 화면을 눌러주세요'))
    workingon.after(a)
    a.click()
  })
})

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

async function renderHWP(file) {
  workingon.innerHTML = file.name + ' 파일을 해석하는중'

  const parseBody = new FormData()
  parseBody.append('openFile', file)
  parseBody.append('format', '')
  parseBody.append('args', '')
  const parsedData = await (await fetch("https://viewer.whale.naver.com/webhwpctrl/open", {
    method: 'POST',
    body: parseBody,
  })).json()

  const renderBody = new FormData()
  renderBody.append('hwpj', new Blob([parsedData.json]))
  renderBody.append('id', uuidv4())
  renderBody.append('filename', file.name)
  renderBody.append('format', 'PDF')
  renderBody.append('args', '')

  console.log(workingon.children)
  workingon.innerHTML = 'PDF로 바꾸는중'

  const fetchedRender = await fetch("https://cors.bridged.cc/https://viewer.whale.naver.com/webhwpctrl/pdf", {
    method: 'POST',
    body: renderBody
  })

  const token = fetchedRender.headers.get('Webhwpctrl-Auth-Token')
  const renderedPdf = await (await fetchedRender.json())

  workingon.innerHTML = '변환 완료!'
  return 'https://viewer.whale.naver.com/webhwpctrl/print/' + renderedPdf.uniqueId + '/' + renderedPdf.fileName + '?token=' + token
}

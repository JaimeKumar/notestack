import './App.css';
import axios from 'axios';
import Stack from './Stack';
import { useEffect, useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import * as $ from 'jquery'

// const server = 'http://localhost:4000/'
const server = 'https://notestack-server.onrender.com/'

export default function App() {
  const newSubObj = () => {return {txt: "", id: uuid(), open: false, edit: true, subs:[]}}
  const [unsaved, setUnsaved] = useState(false)
  const [stack, setStack] = useState({subs: [{txt: "To Do", id: uuid(), open: false, edit: true, subs:[]}]})
  // const [stack, setStack] = useState({subs: [
  //   {
  //     txt: "General", 
  //     id: uuid(),
  //     open: false,
  //     edit: false,
  //     subs: [
  //       {txt: "Apply", id: uuid(), open: false, edit: false, subs: [
  //         {txt: "Check linkdn", id: uuid(), open: false, edit: false, subs: []},
  //         {txt: "Check cvlibrary", id: uuid(), open: false, edit: false, subs: []}
  //       ]},
  //       {txt: "Anish Present", id: uuid(), open: false, edit: false, subs: []}
  //     ]
  //   },
  //   {
  //     txt: "Dates",
  //     id: uuid(),
  //     open: false,
  //     edit: false,
  //     subs: [
  //       {txt: "03 OCT - Pablo Surgery @ 8:00", id: uuid(), open: false, edit: false, subs: []},
  //       {txt: "05 OCT - Piano tuner @ 9:30", id: uuid(), open: false, edit: false, subs: []},
  //       {txt: "07 OCT - Mum bday party here", id: uuid(), open: false, edit: false, subs: []},
  //       {txt: "16 NOV -> 19 NOV - Pablo sitting", id: uuid(), open: false, edit: false, subs: []}
  //     ]
  //   },
  //   {
  //     txt: "Music",
  //     id: uuid(),
  //     open: false,
  //     edit: false,
  //     subs: []
  //   },
  //   {
  //     txt: "Projects",
  //     id: uuid(),
  //     open: false,
  //     edit: false,
  //     subs: []
  //   },
  //   {
  //     txt: "Safe",
  //     id: uuid(),
  //     open: false,
  //     edit: false,
  //     subs: []
  //   }
  // ]})
  const stackRef = useRef(stack)
  const keys = {ctrl: false, shift: false, alt: false};
  const [editing, setEditing] = useState(false)
  const editingRef = useRef(false)
  const [selected, setSelected] = useState(null)
  const selectedRef = useRef(selected);
  const [countShown, setCountShown] = useState(null)
  const [buffering, setBuffering] = useState(false)


  const dbLoad = async () => {
    setBuffering(true)
    axios.get(`${server}load`)
    .then(res => {
      setStack(res.data.stacks)
      setBuffering(false)
    })
    .catch(err => {
      console.log(err)
      setBuffering(false)
    })
  }
  
  const dbSave = async () => {
    setBuffering(true)
    axios.post(`${server}save`, stackRef.current)
    .then(res => {
        setBuffering(false)
        console.log(res)
      })
  }
  
  const localSave = () => {
    localStorage.setItem("notestack", JSON.stringify(stack))
    setUnsaved(false)
  }
  
  const localLoad = () => {
    let load = JSON.parse(localStorage.getItem("notestack"))
    setStack(load)
    setUnsaved(false)
  }

  function openStack(i) {
    let temp = {...stack}
    temp.subs[i].open = !temp.subs[i].open;
    setStack(temp)
  }
  
  function updateStack(i, item) {
    let temp = {...stack}
    temp.subs[i] = item;
    setStack(temp)
  }

  function removeSub(id) {
    setEditing(false)
    let temp = {...stackRef.current}
    setUnsaved(true)
    let parent = findParent(temp.subs)
    if (!parent) {
      parent = temp;
    }

    let i = parent.subs.map(x=>x.id).indexOf(id)
    parent.subs.splice(i, 1)
    selectedRef.current = null;
    if (parent.subs.length < 1) {
      parent.open = false
    } else {
      selectStack(parent.subs[i].id)
    }
    setStack(temp)
  }

  function selectStack(id) {
    if (selectedRef.current===id) return;
    if (selectedRef.current) {
      let temp = {...stackRef.current}
      let sub = findSub(temp.subs)
      sub.edit = false;
      setEditing(false)
      setStack(temp)
    }
    if (selectedRef.current) $(`#${selectedRef.current}`).removeClass('selected')
    setSelected(id)
  }

  const checkSubs = (subs, n) => {
    for (var i = 0; i < subs.length; i++) {
      if (subs[i].id === selectedRef.current) {
        if (subs[i].subs.length > 0 && n > 0 && subs[i].open) {
          return subs[i].subs[0].id;
        } else if (n < 0 && subs[i+n] && subs[i+n].open) {
          return subs[i+n].subs[subs[i+n].subs.length-1].id
        } else if (i + n < subs.length && i + n > -1) {
          return subs[i+n].id;
        } else {
          return 1
        }
      } else if (subs[i].subs.length > 0) {
        let newCheck= checkSubs(subs[i].subs, n);
        if (!newCheck) continue
        if (newCheck === 1) {
          if (i+n < 0) {
            return subs[i].id
          } else if (i+n > subs.length-1) {
            return subs[0].id
          } else {
            return (n>0)?subs[i+n].id:subs[i].id
          }
        } else {
          return newCheck
        }
      }
    }
  }

  const findSub = (subs) => {
    for (var i = 0; i < subs.length; i++) {
      if (subs[i].id === selectedRef.current) {
        return subs[i]
      } else if (subs[i].subs.length > 0 && subs[i].open) {
        let newSubFind = findSub(subs[i].subs)
        if (newSubFind===1) {
          selectStack(subs[i].id)
          return subs;
        } else if (newSubFind) {
          return newSubFind;
        } else {
          continue
        }
      }
    }
  }
  
  const findParent = (subs) => {
    for (var i = 0; i < subs.length; i++) {
      if (subs[i].subs.map(x=>x.id).includes(selectedRef.current)) {
        return subs[i]
      } else {
        let parent = findParent(subs[i].subs)
        if (parent) return parent
      }
    }
  }

  function moveSelected(n) {
    if (editingRef.current) {
      endEdit()
    }
    if (!selectedRef.current) {
      let i = (n>0)?0:stack.subs.length-1;
      selectStack(stackRef.current.subs[i].id)
      return;
    }
    let newSelected = checkSubs(stackRef.current.subs, n)
    if (newSelected === 1) {
      let i = (n>0)?0:stack.subs.length-1;
      selectStack(stackRef.current.subs[i].id)
      return;
    }
    selectStack(newSelected)
  }

  function expandSelected() {
    let temp = {...stackRef.current}
    if (!(selectedRef.current)) return;
    let sub = findSub(temp.subs)
    if (sub.subs.length < 1) return;
    sub.open = true;
    setStack(temp)
  }

  function collapseSelected() {
    let temp = {...stackRef.current}
    if (!(selectedRef.current)) return;
    let sub = findSub(temp.subs)
    if (sub.open === false) {
      let parent = findParent(temp.subs)
      if (!parent) {
        selectStack(stack.subs[0].id)
        return
      }
      selectStack(parent.id)
    } else {
      sub.open = false;
      setStack(temp)
    }
  }

  function editSelected() {
    let temp = {...stackRef.current}
    if (!(selectedRef.current)) return;
    let sub = findSub(temp.subs)
    sub.edit = true;
    setStack(temp)
    setEditing(true)
  }
   
  function endEdit() {
    let temp = {...stackRef.current}
    if (!(selectedRef.current)) return;
    let sub = findSub(temp.subs)
    sub.edit = false;
    sub.txt = $(`#${sub.id}`).text();
    sub.txt = sub.txt.slice(0, sub.txt.length - (Math.floor(sub.subs.length / 10) + 1)).trim()
    if (sub.txt.length < 1) removeSub(sub.id)
    setUnsaved(true)
    setEditing(false)
    setStack(temp)
  }
  
  function newStack() {
    if (editingRef.current) {
      endEdit()
    }
    let temp = {...stackRef.current}
    if (!(selectedRef.current)) return;
    setUnsaved(true)
    let parent = findParent(temp.subs)
    if (!parent) {
      parent = temp;
    }
    let index = parent.subs.map(x=>x.id).indexOf(selectedRef.current)
    parent.subs.splice(index+1, 0, newSubObj())
    selectStack(parent.subs[index+1].id)
    setStack(temp)
    setEditing(true)
    $(`${parent.subs[index+1].id}`).trigger('focus')
  }

  function newSub() {
    let temp = {...stackRef.current}
    if (!(selectedRef.current)) return;
    setUnsaved(true)
    let sub = findSub(temp.subs)
    sub.subs.push(newSubObj())
    sub.open = true;
    selectStack(sub.subs[sub.subs.length-1].id)
    setStack(temp)
  }

  function moveStack(n) {    
    if (!selectedRef.current) return;
    setUnsaved(true)
    let temp = {...stack}
    let parent = findParent(temp.subs)
    if (!parent) parent = temp;
    let sub = findSub(temp.subs)
    let i = parent.subs.map(x=>x.id).indexOf(sub.id)
    parent.subs.splice(i, 1)
    parent.subs.splice(i+n, 0, sub)
    setStack(temp)
  }

  function showCount(id) {
    if (countShown) {
      $(`#${countShown}Count`).css({opacity: '0'})
    }

    if (countShown === id) {
      setCountShown(null)
      return
    }

    $(`#${id}Count`).css({opacity: '1'})
    setCountShown(id)
  }

  useEffect(() => {
    stackRef.current = {...stack}
  }, [JSON.stringify(stack)])

  useEffect(() => {
    if (selected) $(`#${selected}`).addClass('selected');
    selectedRef.current = selected;
  }, [selected])

  useEffect(() => {
    editingRef.current = editing;
  }, [editing])

  useEffect(() => {
    // localLoad()
    window.addEventListener('keydown', e => {
      let lowkey = e.key.toLowerCase()
      switch (lowkey) {
        case 'arrowdown':
          if (keys.alt) {
            moveStack(1)
          } else {
            moveSelected(1)
          }
          break
        case 'arrowup':
          if (keys.alt) {
            moveStack(-1)
          } else {
            moveSelected(-1)
          }
          break
        case 'arrowleft':
          if (editingRef.current) return``
          collapseSelected()
          break
        case 'arrowright':
          if (editingRef.current) return``
          expandSelected()
          break
        case 'enter':
          e.preventDefault()
          if (editingRef.current) {
            if (keys.ctrl) {
              newSub()
            } else {
              newStack()
            }
          } else {
            editSelected()
          }
          break;
        case 'control':
          keys.ctrl = true
          break;
        case 'shift':
          keys.shift = true;
          break;
        case 'alt':
          keys.alt = true;
          break;
        case 'escape':
          endEdit();
          break
        case 's':
          if (keys.ctrl && keys.shift) {
            e.preventDefault()
            localSave()
            dbSave()
          } else if (keys.ctrl) {
            e.preventDefault()
            localSave()
          }
          break;
        case 'o':
          if (keys.ctrl && keys.shift) {
            e.preventDefault()
            dbLoad()
          } else if (keys.ctrl) {
            e.preventDefault()
            localLoad();
          }
          break;
      }
    })

    window.addEventListener('keyup', e => {
      switch (e.key) {
        case 'Control':
          keys.ctrl = false;
          break;
        case 'Shift':
          keys.shift = false;
          break;
        case 'Alt':
          keys.alt = false;
          break;
      }
    })
  }, [])

  return (
    <div className="app">
      {buffering? <div className="bufferBar"></div>:''}
      {unsaved? <div className='unsaved'></div>:''}
      <div className="stacks">
        {stack.subs.map((item, i) => {
          return <Stack 
            key={item.txt+'Key'}
            uuid={uuid}
            item={item}
            openStack={openStack}
            index={i}
            update={updateStack}
            indent={6}
            deleteSub={removeSub}
            selectStack={selectStack}
            setSelected={(id) => {selectStack(id)}}
            keys={keys}
            editOver={() => {setEditing(false)}}
            showCount={showCount}
          />
        })}
      </div>
    </div>
  );
}



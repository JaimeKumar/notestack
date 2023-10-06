import React, { useEffect, useState } from 'react'

export default function Stack({name, subs, indent, click, first, update, index, dbsave, localsave, addSub, addStack, deleteSub}) {
  const keys = {ctrl: false, shift: false}
  const [edit, setedit] = useState(false)

  function handleClick(e) {
    console.log(e.button, e)
    // (e)=>{click(e, name)}
    // if (e.button)
  }

  function opensub(e, i, title) {
    subs[i][title][0] = !subs[i][title][0];
    update(index, subs)
  }

  function updateSubs(i, newObj) {
    subs[i] = newObj;
    update(index, subs)
  }

  function editStack() {
    document.getElementById(name).contentEditable = true;
    document.getElementById(name).focus();
    setedit(true)
  }
  
  function endEdit() {
    if (!document.getElementById(name) || !document.getElementById(name).contentEditable || !edit) return;
    setedit(false)
    let newText = document.getElementById(name).innerHTML.trim();
    console.log(newText)
    if (newText.length < 2) {
      deleteSub(index, name)
      return;
    } 
    let newObj = {}
    newObj[newText] = [...subs]
    update(index, newObj)
    document.getElementById(name).contentEditable = false;
  }

  function newSub(i) {
    if (subs.map(sub => Object.keys(sub)[0]).includes("0%8£n11o2")) return;
    subs.splice(i+1, 0, {"0%8£n11o2": [false]})
    update(index, subs)
  }

  function deleteLine(i, name) {
    if (Object.keys(subs[i])[0] !== name) return
    subs.splice(i, 1)
    console.log(subs[1])
    update(index, subs)
  }

  window.addEventListener('keydown', e => {
    switch (e.key) {
      case 'Escape':
        endEdit();
        break;
      case 'Control':
        keys.ctrl = true;
        break;
      case 'Shift':
        keys.shift = true;
        break;
      case 's':
        if (keys.ctrl && keys.shift) {
          e.preventDefault()
          dbsave()
        } else if (keys.ctrl) {
          e.preventDefault()
          localsave()
        }
        break;
      case 'Enter':
        if (!edit) return;
        if (keys.ctrl) {
          addStack(index)
        } else {
          e.preventDefault()
          endEdit()
          addSub(index)
          // endEdit();
        }
        break;
      case 'x':
        if (keys.ctrl && edit) {
          setedit(false)
          e.preventDefault()
          deleteSub(index, name)
        }
    }

    window.addEventListener('keyup', e => {
      switch (e.key) {
        case 'Control':
          keys.ctrl = false;
          break;
        case 'Shift':
          keys.shift = false;
          break;
      }
    })
  })

  useEffect(() => {
    if (name === "0%8£n11o2") {
        setedit(true)
        document.getElementById("0%8£n11o2").contentEditable = true;
        document.getElementById("0%8£n11o2").focus();
    }
  }, [name])

  return (
    <div className='container' onContextMenu={first ? null:(e)=>{e.preventDefault(); editStack()}} onClick={(e)=>{click(e, name)}} onDoubleClick={first ? null:editStack}>
      <p className="stack" id={name} style={{paddingLeft: `${indent}px`}} onBlur={()=>{endEdit()}}>{(name==="0%8£n11o2")?' ':name}</p>
      {subs[0]?(
        <div className="subs">
          {(subs && subs.length > 0)?subs.map((sub,i) => {
            if (i===0) return;
            let title = Object.keys(sub)[0]
            return <Stack 
              name={title} 
              // subs={sub[title]} 
              subs={[]} 
              indent={indent+20} 
              click={(e)=>{opensub(e, i, title)}} 
              first={false} 
              update={updateSubs} 
              index={i}
              addSub={(i)=>{newSub(i)}}
              addStack={()=>{}}
              deleteSub={deleteLine}
            />
          }):''}
        </div>
      ):''}
    </div>
  )
}

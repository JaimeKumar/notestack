import { useEffect, useRef, useState } from "react";

export default function Stack({item, openStack, index, update, indent, uuid, deleteSub, selectStack, setSelected, editOver, showCount}) {
  const up = () => {update(index, item)}
  const [keys, setKeys] = useState({ctrl: false, shift: false, alt: false})
  const keysRef = useRef(keys)

  function updateStack(i, newItem) {
    item.subs[i] = newItem
    up()
  }

  function openSub(i) {
    item.subs[i].open = !item.subs[i].open;
    up()
  }

  function editStack() {
    setSelected(item.id)
    item.edit = true;
    up()
  }

  function handleClick(e) {
    if (keys.ctrl) {
      editStack()
      return
    } else if (keys.alt) {
      showCount(item.id)
      return
    }
    selectStack(item.id);

    if (item.subs.length > 0 && !item.edit) {
      openStack(index)
    }
  }

  useEffect(() => {
    document.getElementById(item.id).addEventListener('keydown', e => {
      if (e.key === 'x' && keysRef.current.ctrl) {
        deleteSub(item.id)
      }
    })
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Control':
          setKeys(p=> ({
            ...p,
            ctrl: true
          }))
          break;
        case 'Shift':
          setKeys(p=> ({
            ...p,
            shift: true
          }))
          break;
        case 'Alt':
          setKeys(p=> ({
            ...p,
            alt: true
          }))
          break;
      }
    })

    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'Control':
          setKeys(p=> ({
            ...p,
            ctrl: false
          }))
          break;
        case 'Shift':
          setKeys(p=> ({
            ...p,
            shift: false
          }))
          break;
        case 'Alt':
          setKeys(p=> ({
            ...p,
            alt: false
          }))
          break;
      }
    })
  }, [])

  useEffect(() => {
    keysRef.current = keys;
  }, [keys])

  useEffect(() => {
    if (item.edit) {
      document.getElementById(item.id).focus()
      document.getElementById(item.id).SelectionStart = item.txt.length
      document.getElementById(item.id).SelectionEnd = item.txt.length
    }
  }, [item.edit])

  return (
    <>
      <div 
        className='stack'
        id={item.id}
        onClick={handleClick} 
        style={{paddingLeft: `${indent}px`}}
        onContextMenu={e=>{e.preventDefault(); editStack()}}
        onBlur={editOver}
        contentEditable={item.edit}
      >
        <p className="stackText">
          {item.txt}
        </p>
        <div id={`${item.id}Count`} className="subsCount" contentEditable={false}>{item.subs.length}</div>
      </div>
      {item.open?item.subs.map((sub, i) => {
        return <Stack 
          key={sub.txt+'Key'}
          item={sub}
          openStack={openSub}
          index={i}
          indent={indent+20}
          update={updateStack}
          deleteSub={deleteSub}
          uuid={uuid}
          selectStack={selectStack}
          setSelected={setSelected}
          keys={keys}
          editOver={editOver}
          showCount={showCount}
        />
      }):null}
    </>
  )
}

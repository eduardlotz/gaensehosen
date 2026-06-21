import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useCollectionStore } from '../store/collectionStore'
import styles from './AppLayout.module.css'

const themeClass = 'themeLight'
const darkThemeClass = 'themeDark'

export function AppLayout() {
  const theme = useCollectionStore((state) => state.theme)
  const location = useLocation()

  useEffect(() => {
    const root = document.documentElement
    const activeThemeClass = theme === 'light' ? themeClass : darkThemeClass
    const inactiveThemeClass = theme === 'light' ? darkThemeClass : themeClass

    root.classList.add(activeThemeClass)
    root.classList.remove(inactiveThemeClass)

    return () => {
      root.classList.remove(activeThemeClass)
    }
  }, [theme])

  return (
    <div
      className={`${theme === 'light' ? themeClass : darkThemeClass} ${styles.shell}`}
      data-route={location.pathname}
    >
      <Outlet />
    </div>
  )
}

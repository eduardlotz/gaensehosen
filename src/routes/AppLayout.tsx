import { Outlet, useLocation } from 'react-router-dom'
import { useCollectionStore } from '../store/collectionStore'
import styles from './AppLayout.module.css'

const themeClass = 'themeLight'
const darkThemeClass = 'themeDark'

export function AppLayout() {
  const theme = useCollectionStore((state) => state.theme)
  const location = useLocation()

  return (
    <div
      className={`${theme === 'light' ? themeClass : darkThemeClass} ${styles.shell}`}
      data-route={location.pathname}
    >
      <Outlet />
    </div>
  )
}

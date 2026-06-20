import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './routes/AppLayout'
import { AppPage } from './routes/AppPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <AppPage />,
      },
    ],
  },
])

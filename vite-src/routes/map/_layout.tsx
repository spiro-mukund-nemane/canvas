import { createFileRoute, Outlet } from '@tanstack/react-router'
import Header from '../../components/map/header'
// import MapComponent from '../../../components/map/mapView'



export const Route = createFileRoute('/map/_layout')({
  component: RootComponent,
})


export function RootComponent(){
  return(
    <>
     <div className="flex h-screen flex-col">
      <main className='w-full min-h-screen'>
        <Header/>
        <Outlet/>
      </main>
    </div>
    </>
  )
}






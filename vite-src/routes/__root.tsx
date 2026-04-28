import {createRootRoute, Outlet} from '@tanstack/react-router'
// import { Layout } from '@/components/layout'


export const Route =  createRootRoute( {
  component: RootComponent
})

export default function RootComponent(){
  return(
    <>
    <main>
      <Outlet />
    </main>
    </>

  );
}

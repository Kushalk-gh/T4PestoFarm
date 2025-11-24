import React from 'react'
import Seed from './Seed'
import CategorySection from '../../components/CategorySection'
import ProductSection from '../../components/ProductSections'
import FloatingContextMenu from '../../components/FloatingContextMenu'

const Home = () => {
  return (
    <>
    <div className='space-y-5 lg:space-y-10 relative'>
        <Seed/>
        <CategorySection/>
        <ProductSection/>
    </div>
    <FloatingContextMenu />
    </>
  )
}

export default Home

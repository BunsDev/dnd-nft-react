import React from 'react';
import Ogre from '../ogre.png';

const Loader = () => {
  return (
    <div>
      <p className='sub-text'>Minting in progress ⛏️⛏️⛏️</p>
      <img className='ogre' src={Ogre} alt="ogre" />
    </div>
  )
}

export default Loader

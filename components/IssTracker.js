import usePosition from '../helpers/usePosition'
import Position from './Position'
import Distance from './Distance'

const IssTracker = (props) => {
  const myPosition = usePosition()

  return (
    <div className="container">
      <h1>Distance from ISS</h1>
      <Position myPosition={myPosition} />
      <Distance myPosition={myPosition} />
    </div>
  )
}

export default IssTracker

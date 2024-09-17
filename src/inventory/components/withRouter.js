import React from 'react';
import { useLocation, useParams,useNavigate } from 'react-router-dom';
 
const withRouter = WrappedComponent => props => {
    const location = useLocation();
    const params = useParams(); 
    const navigate = useNavigate(); // Add useNavigate hook

  return (
    <WrappedComponent
      {...props}
      location={location}
      params={params}
      navigate={navigate} // Pass navigate to wrapped component

    />
  );
};
 
export default withRouter;
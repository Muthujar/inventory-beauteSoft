import React, { Component } from "react";

class Toast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showToast: false,
      message: "", // holds the message for the toast
    };
  }

  // Function to show the toast with the provided message
  setToastMessage = (message) => {
    this.setState({ showToast: true, message });

    // Automatically hide the toast after 3 seconds
    setTimeout(() => {
      this.setState({ showToast: false });
    }, 3000);
  };

  render() {
    const { showToast, message } = this.state;

    return (
      <div
        className={`toast-container position-fixed bottom-0 start-0 p-3`}
        style={{ zIndex: 1050 }}
      >
        <div
          id="liveToast"
          className={`toast ${showToast ? "show" : "hide"}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="toast-header">
            <strong className="me-auto">Notification</strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => this.setState({ showToast: false })}
              aria-label="Close"
            ></button>
          </div>
          <div className="toast-body">{message}</div>
        </div>
      </div>
    );
  }
}

export default Toast;
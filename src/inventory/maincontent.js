import React, { Component } from "react";
import { Route, Routes } from "react-router-dom";
import { routes } from "./routes";

export default class Maincontent extends Component {
  render() {
    return (
      <div className="content">
        <Routes>
          {routes.map((item,i) => (
            <Route key={i} path={item.path} element={item.element} />
          ))}
        </Routes>
      </div>
    );
  }
}

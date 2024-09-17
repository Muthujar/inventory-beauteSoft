import React, { Component } from "react";
import LimitSearch from "./LimitSearch";
import Pagination from "./pagination";
import sort from "../assets/icons/sort.svg"

export default class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSortKeyDetails: null,
    };
  }

  ///test////
  componentDidMount() {
    let { field = "", orderBy = "" } = this.props;

    if (field && orderBy) {
      this.setState({
        currentSortKeyDetails: { sortKey: field, orderBy },
      });
    }
  }

  //   componentDidMount() {
  //   }

  //   componentDidUpdate(){

  //   }

  // pageLimit = () => {
  //     const {pagination,tableData,setFilteredData}=this.state
  //     let startIndex=(pagination.page-1)*pagination.limit
  //     let endIndex=startIndex+pagination.limit
  //     const filtered=tableData?.slice(startIndex,endIndex)
  //     setFilteredData(filtered)
  //   }

  render() {
    let {
      headerDetails,
      children,
      limit,
      search,
      pagination,
      updatePagination,
      isEmpty = false,
      className = "",
      overFlow = true,
      orderBy,
      t,
    } = this.props;
    // let { sortKey: currentSortKey, orderBy = "" } =
    //   this.state.currentSortKeyDetails || {};
    return (
      <div>
        <div className="ipad-main-table table-container">
          <div
            className={`ipad-table-content ${
              overFlow ? "table-responsive" : ""
            } ${className}`}
          >
            {pagination?.limit && !pagination?.hideLimit && (
              <LimitSearch
                search={pagination.name}
                limit={pagination.limit}
                page={pagination.page}
                updatePagination={updatePagination}
              />
            )}

            <table className="ipad-table">
              <thead>
                <tr>
                  {headerDetails?.map(
                    (
                      {
                        label,
                        className,
                        divClass = "",
                        sortKey = "",
                        enabled,
                        width = "",
                        singleClickFunc,
                        dblclickFunc,
                        checkboxChange,
                        selectAll,
                        selectAllCheck,
                        currentSortKey,
                      },
                      index
                    ) => {
                      return (
                        <th
                          className={className}
                          key={index}
                          style={{
                            width:
                              label && label.length >= 10
                                ? "10px"
                                : label && label.length * 10 + 25 + "px",
                          }}
                        >
                          <div
                            className={`text-start w-75 ${
                              sortKey && "cursor-pointer"
                            } ${divClass}`}
                            onClick={singleClickFunc}
                            onDoubleClick={dblclickFunc}
                          >
                            {label}
                            {/* {selectAll ? (
                            <NormalCheckbox
                              name="selectAllCheck"
                              onChange={checkboxChange}
                              checked={selectAllCheck}
                              type="checkbox"
                              className={`cursor-pointer d-flex m-1`}
                              icon={false}
                            />
                          ) : null} */}
                            {/* {element && element()} */}
                            {sortKey ? (
                              <div
                                className={`d-flex table-filter ml-2 mb-1 ${
                                  currentSortKey === sortKey && "active-filter"
                                }`}
                              >
                                {/* <span
                                className={`icon-sort-up fs-14 ${
                                  currentSortKey === sortKey &&
                                  orderBy === "asc" &&
                                  "active"
                                }`}
                              ><i className="bi-sort-up"></i></span> */}
                                {orderBy === "asc" && enabled? (
                                  <i className="bi-sort-up fs-5"></i>
                                ) : (
                                  ""
                                )}
                                {orderBy === "desc" && enabled? (
                                  <i className="bi-sort-down fs-5"></i>
                                ) : (
                                  ""
                                )}
                                {!enabled &&<img src={sort} className="w-18px"></img>}

                                {/* <span
                                className={`icon-sort-down fs-14 ${
                                  currentSortKey === sortKey &&
                                  orderBy === "desc" &&
                                  "active"
                                }`}
                              ><i className="bi-sort-down"></i></span> */}
                              </div>
                            ) : null}
                          </div>
                        </th>
                      );
                    }
                  )}
                </tr>
              </thead>
              <tbody>{children}</tbody>
            </table>
          </div>
          {pagination && (
            <Pagination
              updatePagination={updatePagination}
              pagination={pagination}
            />
          )}
        </div>
      </div>
    );
  }
}

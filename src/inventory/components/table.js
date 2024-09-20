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
      updateSearch,
      t,
    } = this.props;

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
                updateSearch={updateSearch}

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
                        singleClickFunc,
                        dblclickFunc,
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
                            className={`text-start w-100 d-flex align-items-center justify-content-between ${
                              sortKey && "cursor-pointer"
                            } ${divClass}`}
                            onClick={singleClickFunc}
                            onDoubleClick={dblclickFunc}
                          >
                            {label}
                            {sortKey ? (
                              <div
                                className={`d-flex table-filter ml-2 mb-1 ${
                                  currentSortKey === sortKey && "active-filter"
                                }`}
                              >
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
                              </div>
                            ) : null}
                          </div>
                        </th>
                      );
                    }
                  )}
                </tr>
              </thead>
              <tbody >{children}</tbody>
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

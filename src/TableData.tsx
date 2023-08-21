import React from "react";
import { Table } from "reactstrap";

export interface tableDataType {
  columNames?: string[];
  columnData?: string[][];
}

function TableData({ columNames, columnData }: tableDataType) {
  return (
    <Table bordered striped>
      <thead>
        <tr>
          {columNames?.map((columName) => (
            <th>{columName}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!!columnData?.length &&
          columnData?.map((data) => (
            <tr>
              {data?.map((d) => (
                <td>{d}</td>
              ))}
            </tr>
          ))}
      </tbody>
    </Table>
  );
}

export default TableData;

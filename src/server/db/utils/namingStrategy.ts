import { DefaultNamingStrategy, Table } from 'typeorm'

export class NamingStrategy extends DefaultNamingStrategy {
  foreignKeyName(
    tableOrName: string | Table,
    columnNames: string[],
    referencedTablePath?: string | Table | undefined,
    referencedColumnNames?: string[] | undefined,
  ): string {
    // Produce FK_<Table>_<ReferencedTable>
    const tableName = this.getTableName(tableOrName).replace('.', '_')
    const refName = referencedTablePath
      ? this.getTableName(referencedTablePath as any).replace('.', '_')
      : referencedColumnNames
        ? referencedColumnNames.join('_')
        : ''
    return `FK_${refName}`
  }
  //   joinColumnName(relationName: string, referencedColumnName: string): string {
  //     //console.log('joincolumnname: ', underscore(`${relationName}_${referencedColumnName}`));
  //     return underscore(`${relationName}_${referencedColumnName}`)
  //   }
  //   joinTableColumnName(tableName: string, propertyName: string, columnName?: string | undefined): string {
  //     //console.log('joinTableColumnName: ', underscore(`${tableName}_${columnName ? columnName : propertyName}`));
  //     return underscore(`${singularize(tableName)}_${columnName ?? propertyName}`)
  //   }
  //   joinTableInverseColumnName(tableName: string, propertyName: string, columnName?: string | undefined): string {
  //     //console.log('joinTableInverseColumnName');
  //     return this.joinTableColumnName(tableName, propertyName, columnName)
  //   }

  private constraintName(
    prefix: string,
    columnNames: string[],
    tableOrName: string | Table,
  ) {
    const clonedColumnNames = [...columnNames]
    clonedColumnNames.sort()
    const tableName = this.getTableName(tableOrName)
    const replacedTableName = tableName.replace('.', '_')
    const key = `${replacedTableName}_${clonedColumnNames.join('_')}`
    return `${prefix}_${key}`.substring(0, 128).toUpperCase()
  }

  //   uniqueConstraintName(tableOrName: Table | string, columnNames: string[]) {
  //     const clonedColumnNames = [...columnNames]
  //     clonedColumnNames.sort()
  //     const tableName = this.getTableName(tableOrName)
  //     const replacedTableName = tableName.replace('.', '_')
  //     const key = `${replacedTableName}_${clonedColumnNames.join('_')}`
  //     return `UQ_${key}`.substring(0, 128)
  //   }

  //   defaultConstraintName(tableOrName: Table | string, columnName: string) {
  //     const tableName = this.getTableName(tableOrName)
  //     const replacedTableName = tableName.replace('.', '_')
  //     return `DF_${replacedTableName}__${columnName}`.substring(0, 128)
  //   }
}

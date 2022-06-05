class TableDefinition {
	constructor (details) {
		const {
			tableName, tableKeys, tableVariableDetails = null,
			fileName = null, refreshable = false, refreshTime = 20,
			timeField, recentCheck, staleCheck, dashBoardTab
		} = details;
		this.tableName = tableName;
		this.tableKeys = tableKeys;
		this.tableVariableDetails = tableVariableDetails;
		this.fileName = fileName;
		this.refreshable = refreshTime;
		this.refreshTime = refreshTime;
		this.timeField = timeField;
		this.recentCheck = recentCheck;
		this.staleCheck = staleCheck;
		this.dashBoardTab = dashBoardTab;
	}
	setRefreshStuff(refreshStuff) {
		const {
			tableName, tableKeys, tableVariableDetails = null,
			fileName = null, refreshable = false, refreshTime = 20,
			timeField, recentCheck, staleCheck
		} = details;
	}
	setAddRow(addRowStuff) {
		this.addRowInject = { "command": "addRow", "arguments": [ [addRowStuff], true ], "returnPromise": true}
	}
	setTabulator(tabulator) {
		this.tabulator = tabulator;
	}
	get_ui_control() {
		let tmp = {tabulator: {...this.tabulator,...{cellEdited: global.get("GFuncs").cellEdited}}}
		return tmp;
	}
	get_tableDetails() {
		const tableVariableDetails = (typeof(this.tableVariableDetails) == "string")
											? {context: "global", variable: this.tableVariableDetails, prop: null}
											: this.tableVariableDetails;
		const tableKeys = (typeof(this.tableKeys) == "string") ? [this.tableKeys] : this.tableKeys;
		return {
			tableData: [], tableVariableDetails: tableVariableDetails,
			fileName: this.fileName, tableKeys: tableKeys, lastID: null,
			dashboardTab: this.dashboardTab, refreshable: this.refreshable,
			refreshTime: this.refreshTime, addRowInject: this.addRowInject
		}
	}
}
module.exports.TableDefinition = TableDefinition;
 
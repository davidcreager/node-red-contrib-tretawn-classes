const completeFileName = (inp, ext=".csv") => { return ( ((inp) && !inp.includes(".")) ? ( (!inp.includes("/devices")) ? "/devices/" + inp + ext : inp + ext ) : ( ((inp) && !inp.includes("/devices")) ? "/devices/" + inp : inp ) ) };
const cellEdited = "function(cell){	const rws = cell.getRow().getCells().map((rw)=>{return {field:rw.getField(),val:rw.getValue()}});this.send({ui_control:{callback:'cellEdited',oldValue: cell.getOldValue(),field: cell.getColumn().getField(),rowID: cell.getRow().getIndex(),rowIndex:cell.getRow().getIndex(),rowFields:rws},payload: cell.getValue()});}"
const cellClicker = "function(e,cell){const rws = cell.getRow().getCells().map((rw)=>{return {field:rw.getField(),val:rw.getValue()}});this.send({ui_control:{callback:'buttonClicked','button': cell.getColumn().getDefinition().title,rowID:cell.getRow().getData().id,rowIndex:cell.getRow().getIndex(),row:rws},payload:rws});}"
const deleteColumnClickFunction = "function(e,cell){const rws = cell.getRow().getCells().map((rw)=>{return {field:rw.getField(),val:rw.getValue()}});cell.getRow().delete().then(()=>{this.send({ui_control:{callback:'rowDeleted',rowID: cell.getRow().getData().id,rowIndex: cell.getRow().getIndex(),rowFields:rws},payload:rws});}).catch(()=>console.log('delete row caught error'));}"

const rowUpdated = "function(row){row.reformat()}"
const headerClickFunc = "function(e,col){var tbs=col.getTable().getSorters();var srts = tbs.map( tb => {return {field:tb.field, dir:tb.dir}});this.send({topic:'headerClicked',ui_control:{callback:'headerClicked',column:col.getField(), getSorters: srts },payload:col.getDefinition()})}"
const centerHeader = "function(cell){cell.getElement().style.textAlign='center';return ''+cell.getValue()}"
const deleteColumnFormatter = "function(cell){return \"<i class='fa fa-trash'></i>\"}"
const cellDisplayDate = "function(inpv, type){" +
    	"const inp=new Date(inpv.getValue());console.log('inp='+inp+' type='+type);const nowDate=new Date();" +
    	"const nth=(n)=>{return['st','nd','rd'][((n+90)%100-10)%10-1]||'th'};" +
    	"const displayTime=(inp)=>{const hours=inp.getHours();const mins=inp.getMinutes();const secs=inp.getSeconds();return (((hours<10)?'0'+hours:hours)+':'+((mins<10)?'0'+mins:mins)+':'+((secs<10)?'0'+secs:secs))};" +
    	"const displayDateOnly=(inp)=>{const monthName=inp.toLocaleString('default',{ month:'short'});const day=inp.getDate();const month=inp.getMonth()+1;const year=inp.getYear();if (Math.abs(nowDate-inp)<(24*60*60*1000)){if (inp.getDate() == nowDate.getDate()){return '';} else if ((nowDate.getDate()-inp.getDate())==1){return 'yest';} else if ((inp.getDate()-nowDate.getDate())==1){return 'tmrw';} else{return ('Screwed '+inp);}} else if (Math.abs(nowDate-inp)<(6*24*60*60*1000)){return (['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'][inp.getDay()]);} else{let dt=day+nth(day);let yt=((year==nowDate.getYear())?'':'/'+(year-2000));let mt=((month==nowDate.getMonth()+1)?'':' '+monthName);return (dt+mt+yt);}};" +
    	"const elapsed=(inp) =>{if (Math.abs(nowDate-inp)<(60*1000)){return 'Seconds ago';} else if (Math.abs(nowDate-inp)<(5*60*1000)){return 'Minutes ago';} else if (Math.abs(nowDate-inp)<(60*60*1000)){return Math.round(Math.abs(nowDate-inp)/(60*1000))+' mins ago';} else if (Math.abs(nowDate-inp)<(24*60*60*1000)){return Math.floor(Math.abs(nowDate-inp)/(60*60*1000))+' Hours ago';} else{return Math.floor(Math.abs(nowDate-inp)/(24*60*60*1000))+' Days ago';}};" +
        "if (type == 'date'){return (displayDateOnly(inp));} else if (type=='time'){return (displayTime(inp));} else if (type=='elapsed'){return (elapsed(inp));} else {return (displayDateOnly(inp)+' '+displayTime(inp));}}"	
const applyInitialGroups = (groups, columns) => {
	if (groups) {
		columns.forEach((col) => {
			Object.values(groups).forEach((group, ind) => {
				if (group.fields.find((fld) => fld == col.field)) {
					//col.titleFormatter = "function(){return ('<font color=\"pink\">' + '" + col.title + "')}";
					col.titleFormatter = "function(){return ('<span style=\"background-color:" + group.color + ";\">" + col.title + "</span>')}";
					if ((ind == 0) && (!col.visible)) {
						col.visible = true;
					} else if (!col.visible) {
						col.visible = false;
					}
				}
			});
		});
	}
}
const createRowFormatter = ( timeField, recentCheck, staleCheck ) => {
	let temp = "";
	if (recentCheck) {
		recentCheck.forEach((chk) => {
			temp = ((temp == "") ? "if " : temp + " else if ") + " ((nDate-lDate)<" + (chk.time * 1000) + ")  {dCol='" + chk.color + "';rchk=true;}"
		});
	}
	let temp2 = "";
	if (staleCheck) {
		staleCheck.forEach((chk) => {
			temp2 = ((temp2 == "") ? "if" : temp2 + " else if") + " ((nDate-lDate)>" + (chk.time * 1000) + ") {dCol='" + chk.color + "'}"
		});
	}
	if ((temp != "") || (temp2 != "")) {
		temp = ((temp == "") ? temp2 : temp + "if (!rchk) {" + temp2 + "}");
		if (temp != "") return  ("function(row){var rchk=false;var nDate=new Date();var lDate=new Date(row.getData()." +
			timeField + ");var dCol=(row.getPosition(true)%2==0)?'$rowAltBackgroundColor':'$rowBackgroundColor';" +
			temp + ";row.getElement().style.backgroundColor=dCol}")
	}
	return null;
}

/*
{	tableName: "", tableKeys: "", tableVariableDetails: "", fileName: "", rowIndex = "id"
	dbKeys: null, dbSubProp: null, dbSubKeys: null,
	refreshable: false, refreshTime: 0, dashBoardTab: "",
	addRowFields: [{}],
	recentCheck: [{}], staleCheck: [{}], timeField: "",
	groups: [{}],
	toFile: , fromFile:
}
*/
class TableDefinition {
	constructor (details) {
		try {
		const {
			tableName, tableKeys, tableVariableDetails = null, tableHeader = null, rowIndex = "id",
			dbKeys = null, dbSubProp = null, dbSubKeys = null,
			fileName = null, refreshable = false, refreshTime = 20,
			timeField, recentCheck, staleCheck, dashBoardTab, addRowFields = [],
			groups = [],
			toFile, fromFile
		} = details;
		this.tableName = tableName;
		this.tableKeys = (typeof(tableKeys) == "string") ? [tableKeys] : tableKeys;
		this.tableHeader = (tableHeader == false) ? false : tableHeader || tableName;
		this.dbKeys = (typeof(dbKeys) == "string") ? [dbKeys] : dbKeys;
		this.dbSubKeys = (typeof(dbSubKeys) == "string") ? [dbSubKeys] : dbSubKeys;
		this.dbSubProp = dbSubProp;
		this.tableVariableDetails = (typeof(tableVariableDetails) == "string")
											? {context: "global", variable: tableVariableDetails, prop: null}
											: tableVariableDetails;
		this.fileName = completeFileName(fileName,".json");
		this.refreshable = refreshable;
		this.refreshTime = refreshTime;
		this.dashBoardTab = dashBoardTab;
		this.timeField = timeField;
		this.recentCheck = recentCheck;
		this.staleCheck = staleCheck;
		this.addRowInject = { "command": "addRow", "arguments": [ [addRowFields], true ], "returnPromise": true};
		this.groups = groups;
		this.toFile = toFile;
		this.fromFile = fromFile;
		this.rowIndex = rowIndex || "id";
		} catch(er) {console.log("[TableDefinition] Caught Error " + er)}
	}
	setRefreshStuff(refreshStuff) {
		const {
			tableName, tableKeys, tableVariableDetails = null,
			fileName = null, refreshable = false, refreshTime = 20,
			timeField, recentCheck, staleCheck
		} = details;
	}
	setAddRow(addRowStuff = []) {
		this.addRowInject = { "command": "addRow", "arguments": [ addRowFields, true ], "returnPromise": true}
	}
	setTabulator(tabulator) {
		let rForm = createRowFormatter(this.timeField, this.recentCheck, this.staleCheck);
		this.tabulator = tabulator;
		applyInitialGroups(this.groups, tabulator.columns);
		if ( !tabulator.columns[0].columns && this.tableHeader && tabulator.columns.length != 1) {
			const subColumns = [...tabulator.columns];
			tabulator.columns = [ {title: "<p><center style='font-size: x-large;font-weight: bolder;'>" +  this.tableHeader + "</center></p>", columns: subColumns} ];
		}
		this.tabulator = {...{ index: this.rowIndex, cellEdited: cellEdited, rowUpdated: rowUpdated, layout: "fitColumns", groupBy:""},
							...tabulator};
		if (rForm) this.tabulator.rowFormatter = rForm
	}
	setFunctions(toFile, fromFile) {
		if (toFile) this.toFile = toFile;
		if (fromFile) this.fromFile = fromFile;
	}
	get_ui_control() {
		return {tabulator: this.tabulator, "customHeight": 30};
	}
	get_tableDetails() {
		return {
			tableData: [], lastID: null,
			tableName: this.tableName, tableKeys: this.tableKeys, tableVariableDetails: this.tableVariableDetails, fileName: this.fileName, rowIndex: this.rowIndex,
			dbKeys: this.dbKeys, dbSubProp: this.dbSubProp, dbSubKeys: this.dbSubKeys,
			refreshable: this.refreshable, refreshTime: this.refreshTime, dashBoardTab: this.dashBoardTab,
			addRowInject: this.addRowInject,
			recentCheck: this.recentCheck, staleCheck: this.staleCheck, timeField: this.timeField,
			groups: this.groups, toFile: this.toFile, fromFile: this.fromFile
		}
	}
}
/*
{	tableName: "", tableKeys: "", tableVariableDetails: "", fileName: "",
	dbKeys: null, dbSubProp: null, dbSubKeys: null,
	refreshable: false, refreshTime: 0, dashBoardTab: "",
	addRowFields: [{}],
	recentCheck: [{}], staleCheck: [{}], timeField: "",
	groups: [{}]
}
*/

module.exports.TableDefinition = TableDefinition;
 
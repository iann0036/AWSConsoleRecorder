/**
 * File:        datatables.responsive.js
 * Version:     0.2.0
 * Author:      Seen Sai Yang
 * Info:        https://github.com/Comanche/datatables-responsive
 *
 * Copyright 2013 Seen Sai Yang, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license.
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * You should have received a copy of the GNU General Public License and the
 * BSD license along with this program.  These licenses are also available at:
 *     https://raw.github.com/Comanche/datatables-responsive/master/license-gpl2.txt
 *     https://raw.github.com/Comanche/datatables-responsive/master/license-bsd.txt
 */

'use strict';

/**
 * Constructor for responsive datables helper.
 *
 * This helper class makes datatables responsive to the window size.
 *
 * The parameter, breakpoints, is an object for each breakpoint key/value pair
 * with the following format: { breakpoint_name: pixel_width_at_breakpoint }.
 *
 * An example is as follows:
 *
 *     {
 *         tablet: 1024,
 *         phone: 480
 *     }
 *
 * These breakpoint name may be used as possible values for the data-hide
 * attribute.  The data-hide attribute is optional and may be defined for each
 * th element in the table header.
 *
 * The parameter, options, is an object of options supported by the responsive
 * helper.  The following options are supported:
 *
 *     {
 *          hideEmptyColumnsInRowDetail - Boolean, default: false.
 *          clickOn                     - icon|cell|row, default: icon
 *          showDetail                  - function called when detail row shown
 *          hideDetail                  - function called when detail row hidden
 *     }
 *
 * @param {Object|string} tableSelector jQuery wrapped set or selector for
 *                                      datatables container element.
 * @param {Object} breakpoints          Object defining the responsive
 *                                      breakpoint for datatables.
 * @param {Object} options              Object of options.
 */
function ResponsiveDatatablesHelper(tableSelector, breakpoints, options) {
    if (typeof tableSelector === 'string') {
        this.tableElement = $(tableSelector);
    } else {
        this.tableElement = tableSelector;
    }

    // Get data table API.
    this.api = this.tableElement.dataTable().api();

    // State of column indexes and which are shown or hidden.
    this.columnIndexes = [];
    this.columnsShownIndexes = [];
    this.columnsHiddenIndexes = [];
    this.currentBreakpoint = '';
    this.lastBreakpoint = '';
    this.lastColumnsHiddenIndexes = [];

    // Save state
    var fileName = window.location.pathname.split("/").pop();
    var context = this.api.settings().context[0];

    this.tableId = context.sTableId;
    this.saveState = context.oInit.bStateSave;
    this.cookieName = 'DataTablesResponsiveHelper_' + this.tableId + (fileName ? '_' + fileName : '');
    this.lastStateExists = false;

    // Index of the th in the header tr that stores where the attribute
    //     data-class="expand"
    // is defined.
    this.expandColumn = undefined;
    // Stores original breakpoint defitions
    this.origBreakpointsDefs = undefined;
    // Stores the break points defined in the table header.
    // Each th in the header tr may contain an optional attribute like
    //     data-hide="phone,tablet"
    // These attributes and the breakpoints object will be used to create this
    // object.
    this.breakpoints = {
        /**
         * We will be generating data in the following format:
         *     phone : {
         *         lowerLimit   : undefined,
         *         upperLimit   : 320,
         *         columnsToHide: []
         *     },
         *     tablet: {
         *         lowerLimit   : 320,
         *         upperLimit   : 724,
         *         columnsToHide: []
         *     }
         */
    };

    // Store default options
    this.options = {
        hideEmptyColumnsInRowDetail: false,
        clickOn: 'icon',
        showDetail: null,
        hideDetail: null
    };

    // Expand icon template
    this.expandIconTemplate = '<span class="responsiveExpander"></span>';

    // Row template
    this.rowTemplate = '<tr class="row-detail"><td><ul><!--column item--></ul></td></tr>';
    this.rowLiTemplate = '<li><span class="columnTitle"><!--column title--></span>: <span class="columnValue"><!--column value--></span></li>';

    // Responsive behavior on/off flag
    this.disabled = true;

    // Skip next windows width change flag
    this.skipNextWindowsWidthChange = false;

    // Initialize settings
    this.init(breakpoints, options);
}

/**
 * Responsive datatables helper init function.
 * Builds breakpoint limits for columns and begins to listen to window resize
 * event.
 *
 * See constructor for the breakpoints parameter.
 *
 * @param {Object} breakpoints
 * @param {Object} options
 */
ResponsiveDatatablesHelper.prototype.init = function (breakpoints, options) {
    this.origBreakpointsDefs = breakpoints;
    this.initBreakpoints();

    // Enable responsive behavior.
    this.disable(false);

    // Extend options
    $.extend(this.options, options);
};

ResponsiveDatatablesHelper.prototype.initBreakpoints = function () {
    // Get last state if it exists
    if (this.saveState) {
        this.getState();
    }

    if (!this.lastStateExists) {
        /** Generate breakpoints in the format we need. ***********************/
        // First, we need to create a sorted array of the breakpoints given.
        var breakpointsSorted = [];

        for (var prop in this.origBreakpointsDefs) {
            breakpointsSorted.push({
                name: prop,
                upperLimit: this.origBreakpointsDefs[prop],
                columnsToHide: []
            });
        }

        breakpointsSorted.sort(function (a, b) {
            return a.upperLimit - b.upperLimit;
        });

        // Set lower and upper limits for each breakpoint.
        var lowerLimit = 0;
        for (var i = 0; i < breakpointsSorted.length; i++) {
            breakpointsSorted[i].lowerLimit = lowerLimit;
            lowerLimit = breakpointsSorted[i].upperLimit;
        }

        // Add the default breakpoint which shows all (has no upper limit).
        breakpointsSorted.push({
            name         : 'always',
            lowerLimit   : lowerLimit,
            upperLimit   : Infinity,
            columnsToHide: []
        });

        // Copy the sorted breakpoint array into the breakpoints object using the
        // name as the key.
        this.breakpoints = {};
        var i, l;
        for (i = 0, l = breakpointsSorted.length; i < l; i++) {
            this.breakpoints[breakpointsSorted[i].name] = breakpointsSorted[i];
        }

        /** Create range of visible columns and their indexes *****************/
        // We need the range of all visible column indexes to calculate the
        // columns to show:
        //     Columns to show = all visible columns - columns to hide
        var columns = this.api.columns().header();
        var visibleColumnsHeadersTds = [];
        for (i = 0, l = columns.length; i < l; i++) {
            if (this.api.column(i).visible()) {
                this.columnIndexes.push(i);
                visibleColumnsHeadersTds.push(columns[i]);
            }
        }

        /** Sort columns into breakpoints respectively ************************/
        // Read column headers' attributes and get needed info
        for (var index = 0; index < visibleColumnsHeadersTds.length; index++) {
            // Get the column with the attribute data-class="expand" so we know
            // where to display the expand icon.
            var col = $(visibleColumnsHeadersTds[index]);

            if (col.attr('data-class') === 'expand') {
                this.expandColumn = this.columnIndexes[index];
            }

            // The data-hide attribute has the breakpoints that this column
            // is associated with.
            // If it's defined, get the data-hide attribute and sort this
            // column into the appropriate breakpoint's columnsToHide array.
            var dataHide = col.attr('data-hide');
            if (dataHide !== undefined) {
                var splitBreakingPoints = dataHide.split(/,\s*/);
                for (var i = 0; i < splitBreakingPoints.length; i++) {
                    var bp = splitBreakingPoints[i];
                    if (bp === 'always') {
                        // A column with an 'always' breakpoint is always hidden.
                        // Loop through all breakpoints and add it to each except the
                        // default breakpoint.
                        for (var prop in this.breakpoints) {
                            if (this.breakpoints[prop].name !== 'default') {
                                this.breakpoints[prop].columnsToHide.push(this.columnIndexes[index]);
                            }
                        }
                    } else if (this.breakpoints[bp] !== undefined) {
                        // Translate visible column index to internal column index.
                        this.breakpoints[bp].columnsToHide.push(this.columnIndexes[index]);
                    }
                }
            }
        }
    }
};

/**
 * Sets or removes window resize handler.
 *
 * @param {Boolean} bindFlag
 */
ResponsiveDatatablesHelper.prototype.setWindowsResizeHandler = function(bindFlag) {
    if (bindFlag === undefined) {
        bindFlag = true;
    }

    if (bindFlag) {
        var that = this;
        $(window).bind("resize", function () {
            that.respond();
        });
    } else {
        $(window).unbind("resize");
    }
};

/**
 * Respond window size change.  This helps make datatables responsive.
 */
ResponsiveDatatablesHelper.prototype.respond = function () {
    if (this.disabled) {
        return;
    }
    var that = this;

    // Get new windows width
    var newWindowWidth = $(window).width();

    // Loop through breakpoints to see which columns need to be shown/hidden.
    var newColumnsToHide = [];

    for (var prop in this.breakpoints) {
        var element = this.breakpoints[prop];
        if ((!element.lowerLimit || newWindowWidth > element.lowerLimit) && (!element.upperLimit || newWindowWidth <= element.upperLimit)) {
            this.currentBreakpoint = element.name;
            newColumnsToHide = element.columnsToHide;
        }
    }

    // Find out if a column show/hide should happen.
    // Skip column show/hide if this window width change follows immediately
    // after a previous column show/hide.  This will help prevent a loop.
    var columnShowHide = false;
    if (!this.skipNextWindowsWidthChange) {
        // Check difference in length
        if (this.lastBreakpoint.length === 0 && newColumnsToHide.length) {
            // No previous breakpoint and new breakpoint
            columnShowHide = true;
        } else if (this.lastBreakpoint != this.currentBreakpoint) {
            // Different breakpoints
            columnShowHide = true;
        } else if (this.columnsHiddenIndexes.length !== newColumnsToHide.length) {
            // Difference in number of hidden columns
            columnShowHide = true;
        } else {
            // Possible same number of columns but check for difference in columns
            var d1 = this.difference(this.columnsHiddenIndexes, newColumnsToHide).length;
            var d2 = this.difference(newColumnsToHide, this.columnsHiddenIndexes).length;
            columnShowHide = d1 + d2 > 0;
        }
    }

    if (columnShowHide) {
        // Showing/hiding a column at breakpoint may cause a windows width
        // change.  Let's flag to skip the column show/hide that may be
        // caused by the next windows width change.
        this.skipNextWindowsWidthChange = true;
        this.columnsHiddenIndexes = newColumnsToHide;
        this.columnsShownIndexes = this.difference(this.columnIndexes, this.columnsHiddenIndexes);
        this.showHideColumns();
        this.lastBreakpoint = this.currentBreakpoint;
        this.setState();
        this.skipNextWindowsWidthChange = false;
    }


    // We don't skip this part.
    // If one or more columns have been hidden, add the has-columns-hidden class to table.
    // This class will show what state the table is in.
    if (this.columnsHiddenIndexes.length) {
        this.tableElement.addClass('has-columns-hidden');

        // Show details for each row that is tagged with the class .detail-show.
        $('tr.detail-show', this.tableElement).each(function (index, element) {
            var tr = $(element);
            if (tr.next('.row-detail').length === 0) {
                ResponsiveDatatablesHelper.prototype.showRowDetail(that, tr);
            }
        });
    } else {
        this.tableElement.removeClass('has-columns-hidden');
        $('tr.row-detail').each(function (event) {
            ResponsiveDatatablesHelper.prototype.hideRowDetail(that, $(this).prev());
        });
    }
};

/**
 * Show/hide datatables columns.
 */
ResponsiveDatatablesHelper.prototype.showHideColumns = function () {
    // Calculate the columns to show
    // Show columns that may have been previously hidden.
    for (var i = 0, l = this.columnsShownIndexes.length; i < l; i++) {
        this.api.column(this.columnsShownIndexes[i]).visible(true);
    }

    // Hide columns that may have been previously shown.
    for (var i = 0, l = this.columnsHiddenIndexes.length; i < l; i++) {
        this.api.column(this.columnsHiddenIndexes[i]).visible(false);
    }

    // Rebuild details to reflect shown/hidden column changes.
    var that = this;
    $('tr.row-detail').each(function () {
        ResponsiveDatatablesHelper.prototype.hideRowDetail(that, $(this).prev());
    });
    if (this.tableElement.hasClass('has-columns-hidden')) {
        $('tr.detail-show', this.tableElement).each(function (index, element) {
            ResponsiveDatatablesHelper.prototype.showRowDetail(that, $(element));
        });
    }
};

/**
 * Create the expand icon on the column with the data-class="expand" attribute
 * defined for it's header.
 *
 * @param {Object} tr table row object
 */
ResponsiveDatatablesHelper.prototype.createExpandIcon = function (tr) {
    if (this.disabled) {
        return;
    }

    // Get the td for tr with the same index as the th in the header tr
    // that has the data-class="expand" attribute defined.
    var tds = $('td', tr);
    // Loop through tds and create an expand icon on the td that has a column
    // index equal to the expand column given.
    for (var i = 0, l = tds.length; i < l; i++) {
        var td = tds[i];
        var tdIndex = this.api.cell(td).index().column;
        td = $(td);
        if (tdIndex === this.expandColumn) {
            // Create expand icon if there isn't one already.
            if ($('span.responsiveExpander', td).length == 0) {
                td.prepend(this.expandIconTemplate);

                // Respond to click event on expander icon.
                switch (this.options.clickOn) {
                    case 'cell':
                        td.on('click', {responsiveDatatablesHelperInstance: this}, this.showRowDetailEventHandler);
                        break;
                    case 'row':
                        $(tr).on('click', {responsiveDatatablesHelperInstance: this}, this.showRowDetailEventHandler);
                        break;
                    default:
                        td.on('click', 'span.responsiveExpander', {responsiveDatatablesHelperInstance: this}, this.showRowDetailEventHandler);
                        break;
                }
            }
            break;
        }
    }
};

/**
 * Show row detail event handler.
 *
 * This handler is used to handle the click event of the expand icon defined in
 * the table row data element.
 *
 * @param {Object} event jQuery event object
 */
ResponsiveDatatablesHelper.prototype.showRowDetailEventHandler = function (event) {
    var responsiveDatatablesHelperInstance = event.data.responsiveDatatablesHelperInstance;
    if (responsiveDatatablesHelperInstance.disabled) {
        return;
    }

    var td = $(this);

    // Nothing to do if there are no columns hidden.
    if (!td.closest('table').hasClass('has-columns-hidden')) {
        return;
    }

    // Get the parent tr of which this td belongs to.
    var tr = td.closest('tr');

    // Show/hide row details
    if (tr.hasClass('detail-show')) {
        ResponsiveDatatablesHelper.prototype.hideRowDetail(responsiveDatatablesHelperInstance, tr);
    } else {
        ResponsiveDatatablesHelper.prototype.showRowDetail(responsiveDatatablesHelperInstance, tr);
    }

    tr.toggleClass('detail-show');

    // Prevent click event from bubbling up to higher-level DOM elements.
    event.stopPropagation();
};

/**
 * Show row details.
 *
 * @param {ResponsiveDatatablesHelper} responsiveDatatablesHelperInstance instance of ResponsiveDatatablesHelper
 * @param {Object}                     tr                                 jQuery wrapped set
 */
ResponsiveDatatablesHelper.prototype.showRowDetail = function (responsiveDatatablesHelperInstance, tr) {
    // Get column because we need their titles.
    var api = responsiveDatatablesHelperInstance.api;
    var columns = api.columns().header();

    // Create the new tr.
    var newTr = $(responsiveDatatablesHelperInstance.rowTemplate);

    // Get the ul that we'll insert li's into.
    var ul = $('ul', newTr);

    // Loop through hidden columns and create an li for each of them.
    for (var i = 0; i < responsiveDatatablesHelperInstance.columnsHiddenIndexes.length; i++) {
        var index = responsiveDatatablesHelperInstance.columnsHiddenIndexes[i];

        // Get row td
        var rowIndex = api.row(tr).index();
        var td = api.cell(rowIndex, index).node();

        // Don't create li if contents are empty (depends on hideEmptyColumnsInRowDetail option).
        if (!responsiveDatatablesHelperInstance.options.hideEmptyColumnsInRowDetail || td.innerHTML.trim().length) {
            var li = $(responsiveDatatablesHelperInstance.rowLiTemplate);
            var hiddenColumnName = $(columns[index]).attr('data-name');
            $('.columnTitle', li).html(hiddenColumnName !== undefined ? hiddenColumnName : columns[index].innerHTML);
            var contents = $(td).contents();
            var clonedContents = contents.clone();

            // Select elements' selectedIndex are not cloned.  Do it manually.
            for (var n = 0, m = contents.length; n < m; n++) {
                var node = contents[n];
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SELECT') {
                    clonedContents[n].selectedIndex = node.selectedIndex
                }
            }

            // Set the column contents and save the original td source.
            $('.columnValue', li).append(clonedContents).data('originalTdSource', td);

            // Copy index to data attribute, so we'll know where to put the value when the tr.row-detail is removed.
            li.attr('data-column', index);

            // Copy td class to new li.
            var tdClass = $(td).attr('class');
            if (tdClass !== 'undefined' && tdClass !== false && tdClass !== '') {
                      li.addClass(tdClass)
            }

            ul.append(li);
        }
    }

    // Create tr colspan attribute.
    var colspan = responsiveDatatablesHelperInstance.columnIndexes.length - responsiveDatatablesHelperInstance.columnsHiddenIndexes.length;
    newTr.find('> td').attr('colspan', colspan);

    // Append the new tr after the current tr.
    tr.after(newTr);

    // call the showDetail function if needbe
    if (responsiveDatatablesHelperInstance.options.showDetail){
        responsiveDatatablesHelperInstance.options.showDetail(newTr);
    }
};

/**
 * Hide row details.
 *
 * @param {ResponsiveDatatablesHelper} responsiveDatatablesHelperInstance instance of ResponsiveDatatablesHelper
 * @param {Object}                     tr                                 jQuery wrapped set
 */
ResponsiveDatatablesHelper.prototype.hideRowDetail = function (responsiveDatatablesHelperInstance, tr) {
    // If the value of an input has changed while in row detail, we need to copy its state back
    // to the DataTables object so that value will persist when the tr.row-detail is removed.
    var rowDetail = tr.next('.row-detail');
    if (responsiveDatatablesHelperInstance.options.hideDetail){
        responsiveDatatablesHelperInstance.options.hideDetail(rowDetail);
    }
    rowDetail.find('li').each(function () {
        var columnValueContainer = $(this).find('span.columnValue');
        var tdContents = columnValueContainer.contents();
        var td = columnValueContainer.data('originalTdSource');
        $(td).empty().append(tdContents);
    });
    rowDetail.remove();
};

/**
 * Enable/disable responsive behavior and restores changes made.
 *
 * @param {Boolean} disable, default is true
 */
ResponsiveDatatablesHelper.prototype.disable = function (disable) {
    this.disabled = (disable === undefined) || disable;

    if (this.disabled) {
        // Remove windows resize handler.
        this.setWindowsResizeHandler(false);

        // Remove all trs that have row details.
        $('tbody tr.row-detail', this.tableElement).remove();

        // Remove all trs that are marked to have row details shown.
        $('tbody tr', this.tableElement).removeClass('detail-show');

        // Remove all expander icons.
        $('tbody tr span.responsiveExpander', this.tableElement).remove();

        this.columnsHiddenIndexes = [];
        this.columnsShownIndexes = this.columnIndexes;
        this.showHideColumns();
        this.tableElement.removeClass('has-columns-hidden');

        this.tableElement.off('click', 'span.responsiveExpander', this.showRowDetailEventHandler);
    } else {
        // Add windows resize handler.
        this.setWindowsResizeHandler();
    }
};

/**
 * Get state from cookie.
 */
ResponsiveDatatablesHelper.prototype.getState = function () {
    if (typeof(Storage)) {
        // Use local storage
        var value = JSON.parse(localStorage.getItem(this.cookieName));
        if (value) {
            this.columnIndexes = value.columnIndexes;
            this.breakpoints = value.breakpoints;
            this.expandColumn = value.expandColumn;
            this.lastBreakpoint = value.lastBreakpoint;
            this.lastStateExists = true;
        }
    } else {
        // No local storage.
    }
};

/**
 * Saves state to cookie.
 */
ResponsiveDatatablesHelper.prototype.setState = function () {
    if (typeof(Storage)) {
        // Use local storage
        var d1 = this.difference(this.lastColumnsHiddenIndexes, this.columnsHiddenIndexes).length;
        var d2 = this.difference(this.columnsHiddenIndexes, this.lastColumnsHiddenIndexes).length;

        if (d1 + d2 > 0) {
            var tt;
            var value = {
                columnIndexes: this.columnIndexes,               // array
                columnsHiddenIndexes: this.columnsHiddenIndexes, // array
                breakpoints: this.breakpoints,                   // object
                expandColumn: this.expandColumn,                 // int|undefined
                lastBreakpoint: this.lastBreakpoint              // string
            };

            localStorage.setItem(this.cookieName, JSON.stringify(value));
            this.lastColumnsHiddenIndexes = this.columnsHiddenIndexes.slice(0);
        }
    } else {
        // No local storage.
    }
};

/**
 * Get Difference.
 */
ResponsiveDatatablesHelper.prototype.difference = function (a, b) {
    var arr = [], i, hash = {};
    for (i = b.length - 1; i >= 0; i--) {
        hash[b[i]] = true;
    }
    for (i = a.length - 1; i >= 0; i--) {
        if (hash[a[i]] !== true) {
            arr.push(a[i]);
        }
    }
    return arr;
};

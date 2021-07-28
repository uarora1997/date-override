$(document).ready(function() {
    $('#datepicker').datepicker({
        multidate: true,
        todayHighlight: true,
        format: 'dd/mm/yyyy',
        clearBtn: true,
        startDate: '-0m'
    });
    $.ajax({
        url: "getDateOverrides.php",
        type: "POST",
        data: { staffId: 1 }
    }).done(function(dateOverrides) {
        $.ajax({
            url: "getWeeklyAvailabilities.php",
            type: "POST",
            data: { staffId: 1 }
        }).done(function(weeklyAvailabity) {
            calendar.init(dateOverrides, weeklyAvailabity);
        });
    });
});

var calendar = {
    init: function(dateOverrides, weeklyAvailabity) {
        this.dateOverrides = { dates: [], slots: [] };
        this.weeks = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thrusday",
            "friday",
            "saturday"
        ];
        if (dateOverrides !== "0 results") {
            this.dateOverridesFetched = JSON.parse(dateOverrides);
        } else {
            this.dateOverridesFetched = [];
        }
        if (weeklyAvailabity !== "0 results") {
            this.weeklyAvailabity = JSON.parse(weeklyAvailabity);
        } else {
            this.weeklyAvailabity = {};
        }
        this.createListeners();
        this.renderOverrides();
    },
    createListeners: function() {
        var _this = this;
        $('#datepicker').on('changeDate', async function(evt) {
            var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
            _this.dateOverrides.slots = [];
            if (evt.dates.length > 0) {
                var date = new Date(evt.date);
                if (date.getDate().length < 2) {
                    date = date.getFullYear() + "-" + months[date.getMonth()] + "-0" + date.getDate();
                } else {
                    date = date.getFullYear() + "-" + months[date.getMonth()] + "-" + date.getDate();
                }
                _this.dateOverrides.dates = evt.dates;
                if (_this.dateOverridesFetched.findIndex(dateOverwrite => dateOverwrite.date == date) >= 0) {
                    var overrideIndex = _this.dateOverridesFetched.findIndex(dateOverwrite => dateOverwrite.date == date);
                    _this.dateOverrides.slots = JSON.parse(_this.dateOverridesFetched[overrideIndex].slots);
                } else {
                    if (_this.weeklyAvailabity[_this.weeks[evt.date.getDay()]]) {
                        var weekSlots = JSON.parse(_this.weeklyAvailabity[_this.weeks[evt.date.getDay()]]);
                        for (var i = 0; i < weekSlots.start_time.length; i++) {
                            var startTime = weekSlots.start_time[i];
                            if (startTime.length < 5) {
                                startTime = "0" + startTime;
                            }
                            var endTime = weekSlots.end_time[i];
                            if (endTime.length < 2) {
                                endTime = "0" + endTime;
                            }
                            _this.dateOverrides.slots.push({ startTime: startTime, endTime: endTime });
                        }
                    } else {
                        var startTime = "09:00";
                        var endTime = "17:00";
                        _this.dateOverrides.slots.push({ startTime: startTime, endTime: endTime });
                    };
                }
            } else {
                _this.dateOverrides.dates = [];
                _this.dateOverrides.slots = [];
            }
            await _this.renderSlot();
        });
        $(document).on('click', '.btnSubmit', function(evt) {
            evt.preventDefault();
            _this.submit(_this.dateOverrides);
        });
    },
    renderSlot: async function() {
        _this = this;
        await $('.time').html(``);
        if (_this.dateOverrides.slots && _this.dateOverrides.slots.length > 0) {
            for (var i = 0; i < _this.dateOverrides.slots.length; i++) {
                $('.time').append(`
                    <div class="slot">
                        <input 
                            type="time"
                            class='startTime'
                            data-target="changeValue"
                            datakey="startTime"
                            datavalue="${i}"
                            value="${_this.dateOverrides.slots[i].startTime}"
                        /> -- 
                        <input 
                            type="time"
                            class='endTime'
                            data-target="changeValue"
                            datakey="endTime"
                            datavalue="${i}"
                            value="${_this.dateOverrides.slots[i].endTime}"
                        />
                        <svg width="24" height="24" onclick="_this.deleteSlot(${i})" style="cursor: pointer"; xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
                            <path d="M19 24h-14c-1.104 0-2-.896-2-2v-16h18v16c0 1.104-.896 2-2 2m-9-14c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6-5h-20v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2zm-12-2h4v-1h-4v1z" fill="#f00" />
                        </svg>
                    </div><br/>
                `);
            }
        } else if (_this.dateOverrides.dates.length > 0) {
            $('.time').append(`<strong style="font-size: 1.5rem;">Unavailable</strong><br/><br/>`);
        }
        await $('.btnAdd').remove();
        if (_this.dateOverrides.dates.length > 0) {
            $(".time").append(`<span class="btnAdd" onclick="_this.addSlot()">+ Add Slot</span>`);
        }
        _this.createChangeValueListener();
    },
    addSlot: function() {
        _this = this;
        _this.dateOverrides.slots.push({ startTime: "09:00", endTime: "17:00" });
        _this.renderSlot();
    },
    deleteSlot: function(slotIndex) {
        _this = this;
        _this.dateOverrides.slots.splice(slotIndex, 1);
        _this.renderSlot();
    },
    createChangeValueListener: function() {
        _this = this;
        $('[data-target=changeValue]').change((evt) => {
            if (evt.target.attributes.datakey.nodeValue == 'endTime') {
                if (_this.dateOverrides.slots[evt.target.attributes.datavalue.nodeValue].startTime < evt.target.value) {
                        _this.dateOverrides.slots[evt.target.attributes.datavalue.nodeValue][evt.target.attributes.datakey.nodeValue] = evt.target.value;
                }
            } else if (evt.target.value < _this.dateOverrides.slots[evt.target.attributes.datavalue.nodeValue].endTime) {
                    _this.dateOverrides.slots[evt.target.attributes.datavalue.nodeValue][evt.target.attributes.datakey.nodeValue] = evt.target.value;
                }
            _this.renderSlot();
        });
    },
    submit: async (dateOverrides) => {
        if (dateOverrides.dates.length > 0) {
            var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
            for (var i = 0; i < dateOverrides.dates.length; i++) {
                var submitObj = { staffId: 1 };
                submitObj.scheduleId = 1;
                submitObj.staffId = 1;
                submitObj.date = dateOverrides.dates[i];
                submitObj.date = new Date(submitObj.date);
                if (submitObj.date.getDate().length < 2) {
                    submitObj.date = submitObj.date.getFullYear() + "-" + months[submitObj.date.getMonth()] + "-0" + submitObj.date.getDate();
                } else {
                    submitObj.date = submitObj.date.getFullYear() + "-" + months[submitObj.date.getMonth()] + "-" + submitObj.date.getDate();
                }
                submitObj.slots = dateOverrides.slots;
                if (_this.dateOverridesFetched.findIndex(dateOverwrite => dateOverwrite.date == submitObj.date) >= 0) {
                    submitObj.overwriteId = await _this.dateOverridesFetched[_this.dateOverridesFetched.findIndex(dateOverwrite => dateOverwrite.date == submitObj.date)].id;
                    await $.ajax({
                        url: "updateOverrides.php",
                        method: "POST",
                        data: submitObj
                    });
                } else {
                    await $.ajax({
                        url: "addDateOverrides.php",
                        method: "POST",
                        data: submitObj
                    }).done(function(msg) {
                        console.log(msg)
                    }).fail(function(err) {
                        console.log(err)
                    });
                }
            }
            window.location.reload();
        } else {
            alert("No Override Selected to add or update");
        }
    },
    renderOverrides: function() {
        _this = this;
        $(".displayOverrides").html(``);
        for (var i = 0; i < _this.dateOverridesFetched.length; i++) {
            var appendingHTML = `<div class="dateOverride">${_this.dateOverridesFetched[i].date}`;
                var slots = JSON.parse(_this.dateOverridesFetched[i].slots);
            if (_this.dateOverridesFetched[i].slots && slots.length > 0) {
                for (var s = 0; s < slots.length; s++) {
                    if(s == 0){
                        appendingHTML += ` ${slots[s].startTime} - ${slots[s].endTime}`;
                    } else {
                        appendingHTML += `, ${slots[s].startTime} - ${slots[s].endTime}`;
                    }
                }
            } else {
                appendingHTML += ` Unavailable`;
            }
            appendingHTML += `<img style="cursor: pointer;" src="bin.svg" width="16" height="18" onclick="_this.deleteDateOverride('${_this.dateOverridesFetched[i].id}')"></div>`;
            $(".displayOverrides").append(appendingHTML);
        }
    },
    deleteDateOverride: async function(overrideId) {
        _this = this;
        $.ajax({
            url: "deleteDateOverride.php",
            method: "POST",
            data: { overrideId: overrideId }
        });
        window.location.reload();
    }
}
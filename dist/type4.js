(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.TappyType4Family= factory();
    }
}(this, function () {
    var commandFamily = new Uint8Array([0x00,0x04]);
    
    var getMissingMethods = function(instance,methods) {
        var missing = [];
        for(var i = 0; i < methods.length; i++) {
            var method = methods[i];
            if(typeof instance[method] !== "function") {
                missing.push(method);
            }
        }
        return missing;
    };

    var implementsMethods = function(instance,methods) {
        var missingMethods = getMissingMethods(instance,methods);
        if(missingMethods === null || missingMethods.length > 0) {
            return false;
        } else {
            return true;
        }
    };
    
    var arrEquals = function(a1, a2) {
        return (a1.length == a2.length) && a1.every(function(e, i){
            return e === a2[i];
        });
    };

    var cmdMethods = ["getCommandFamily","getCommandCode","getPayload"];

    var c = {};
    
    var CommandCodes = {
        TransceiveApdu: 0x02,
        DetectType4B: 0x03,
        DetectType4BSpecificAfi: 0x04,
        DetectType4: 0x01,
        GetLibraryVersion: 0xFF,
    };

    var typeChecker = function(commandCode) {
        return function(cmd) {
            if(typeof cmd !== "object" || cmd === null) {
                throw new Error("Command passed to check type must be an object implementing: "+cmdMethods.join(", "));
            } else if(!implementsMethods(cmd,cmdMethods)) {
                throw new Error("Command passed to check type must also implement: "+
                        getMissingMethods(cmd,cmdMethods).join(", "));
            }
            else {
                return arrEquals(cmd.getCommandFamily(),commandFamily) && cmd.getCommandCode() === commandCode;
            }
        };
    };

    var AbsProto = function(commandCode){
        return {
            getCommandFamily: function() {
                return commandFamily;
            },

            getCommandCode: function() {
                return commandCode; 
            },

            getPayload: function() {
                return [];
            },

            parsePayload: function() {

            },

        };
    };
    
    var d4b = function(timeout) {
        if(typeof timeout === "undefined") {
            this.timeout = 0x00;
        } else {
            this.timeout = timeout;
        }
    };
    d4b.prototype = AbsProto(CommandCodes.DetectType4B);
    d4b.prototype.getTimeout = function() {
        return this.timeout;
    };
    d4b.prototype.setTimeout = function(timeout) {
        this.timeout = timeout;
    };
    d4b.prototype.parsePayload = function (payload) {
        if(payload.length < 1) {
            throw new Error("Invalid payload: must be at least one byte");
        }
        this.timeout = payload[0];
    };
    d4b.prototype.getPayload = function() {
        return new Uint8Array([this.timeout]);
    };
    d4b.isTypeOf = typeChecker(CommandCodes.DetectType4B);
    c.DetectType4B = d4b;
    
    var d4bafi = function(timeout, afi) {
        if(typeof timeout === "undefined") {
            this.timeout = 0x00;
        } else {
            this.timeout = timeout;
        }

        if(typeof afi === "undefined") {
            this.afi = 0x00;
        } else {
            this.afi = afi;
        }
    };
    d4bafi.prototype = AbsProto(CommandCodes.DetectType4BSpecificAfi);
    d4bafi.prototype.getTimeout = function() {
        return this.timeout;
    };
    d4bafi.prototype.setTimeout = function(timeout) {
        this.timeout = timeout;
    };
    d4bafi.prototype.getAfi = function() {
        return this.afi;
    };
    d4bafi.prototype.setAfi = function(afi) {
        this.afi = afi;
    };
    d4bafi.prototype.parsePayload = function (payload) {
        if(payload.length < 2) {
            throw new Error("Invalid payload: must be at least two bytes");
        }
        this.timeout = payload[0];
        this.afi = payload[1];
    };
    d4bafi.prototype.getPayload = function() {
        return new Uint8Array([this.timeout,this.afi]);
    };
    d4bafi.isTypeOf = typeChecker(CommandCodes.DetectType4BSpecificAfi);
    c.DetectType4BSpecificAfi = d4bafi;
    
    var d4a = function(timeout) {
        if(typeof timeout === "undefined") {
            this.timeout = 0x00;
        } else {
            this.timeout = timeout;
        }
    };
    d4a.prototype = AbsProto(CommandCodes.DetectType4);
    d4a.prototype.getTimeout = function() {
        return this.timeout;
    };
    d4a.prototype.setTimeout = function(timeout) {
        this.timeout = timeout;
    };
    d4a.prototype.parsePayload = function (payload) {
        if(payload.length < 1) {
            throw new Error("Invalid payload: must be at least one byte");
        }
        this.timeout = payload[0];
    };
    d4a.prototype.getPayload = function() {
        return new Uint8Array([this.timeout]);
    };
    d4a.isTypeOf = typeChecker(CommandCodes.DetectType4);
    c.DetectType4 = d4a;
    
    var glv = function() {
    };
    glv.prototype = AbsProto(CommandCodes.GetLibraryVersion);
    glv.isTypeOf = typeChecker(CommandCodes.GetLibraryVersion);
    c.GetLibraryVersion = glv;
    
    var sendapdu = function(apdu) {
        if(typeof apdu === "undefined") {
            this.apdu = new Uint8Array(0);
        } else {
            this.apdu = apdu;
        }
    };
    sendapdu.prototype = AbsProto(CommandCodes.TransceiveApdu);
    sendapdu.prototype.getApdu = function() {
        return this.apdu;
    };
    sendapdu.prototype.setApdu = function(apdu) {
        this.apdu = apdu;
    };
    sendapdu.prototype.parsePayload = function (payload) {
        this.apdu = payload;
    };
    sendapdu.prototype.getPayload = function() {
        return this.apdu;
    };
    sendapdu.isTypeOf = typeChecker(CommandCodes.TransceiveApdu);
    c.TransceiveApdu = sendapdu;
  
    var r = {};
    var ResponseCodes = {
        ApduTransceiveSuccessful: 0x02,
        Type4BDetected: 0x07,
        Type4Detected: 0x01,
        Type4LibraryVersion: 0x05,
        Type4PollingError: 0x04,
        Type4Timeout: 0x03,
        Type4Error: 0x7F
    };
    
    r.ApduTransceiveSuccessful = function(apdu) {
        if(typeof apdu === "undefined") {
            this.apdu = new Uint8Array(0);
        } else {
            this.apdu = apdu;
        }
    };
    r.ApduTransceiveSuccessful.prototype = AbsProto(ResponseCodes.ApduTransceiveSuccessful);
    r.ApduTransceiveSuccessful.isTypeOf = typeChecker(ResponseCodes.ApduTransceiveSuccessful);
    r.ApduTransceiveSuccessful.prototype.getPayload = function() {
        return this.apdu;
    };
    r.ApduTransceiveSuccessful.prototype.parsePayload = function(payload) {
        this.apdu = payload;
    };
    r.ApduTransceiveSuccessful.prototype.getApdu = function() {
        return this.apdu;
    };
    r.ApduTransceiveSuccessful.prototype.setApdu = function(apdu) {
        this.apdu = apdu;
    };
    
    
    r.Type4BDetected = function(atqb,attrib) {
        if(typeof atqb === "undefined") {
            this.atqb = new Uint8Array(0);
        } else {
            this.atqb = atqb;
        }
        
        if(typeof attrib === "undefined") {
            this.attrib = new Uint8Array(0);
        } else {
            this.attrib = attrib;
        }
    };
    r.Type4BDetected.prototype = AbsProto(ResponseCodes.Type4BDetected);
    r.Type4BDetected.isTypeOf = typeChecker(ResponseCodes.Type4BDetected);
    r.Type4BDetected.prototype.getPayload = function() {
        var payload = new Uint8Array(this.atqb.length+this.attrib.length+2);
        payload[0] = this.atqb.length;
        payload[1] = this.attrib.length;
        if(this.atqb.length > 0) {
            payload.set(this.atqb,2);
        }
        if (this.attrib.length > 0) {
            payload.set(this.attrib,2+this.atqb.length);
        }
        return payload;
    };
    r.Type4BDetected.prototype.parsePayload = function(payload) {
        if(payload.length < 2) {
            throw new Error("Payload must be at least 2 bytes");
        }

        var atqbLen = payload[0];
        var attribLen = payload[1];
        if(payload.length < (2+atqbLen+attribLen)) {
            throw new Error("Payload too short to contain specified ATQB and ATTRIB");
        }

        if(atqbLen > 0) {
            this.atqb = payload.slice(2,2+atqbLen);
        } else {
            this.atqb = new Uint8Array(0);
        }

        if(attribLen > 0) {
            this.attrib = payload.slice(2+atqbLen,2+atqbLen+attribLen);
        } else {
            this.attrib = new Uint8Array(0);
        }
    };
    r.Type4BDetected.prototype.getAtqb = function() {
        return this.atqb;
    };
    r.Type4BDetected.prototype.setAtqb = function(atqb) {
        this.atqb = atqb;
    };
    r.Type4BDetected.prototype.getAttrib = function() {
        return this.attrib;
    };
    r.Type4BDetected.prototype.setAttrib = function(attrib) {
        this.attrib = attrib;
    };
    
    r.Type4Detected = function(uid,ats) {
        if(typeof uid === "undefined") {
            this.uid = new Uint8Array(0);
        } else {
            this.uid = uid;
        }
        
        if(typeof ats === "undefined") {
            this.ats = new Uint8Array(0);
        } else {
            this.ats = ats;
        }
    };
    r.Type4Detected.prototype = AbsProto(ResponseCodes.Type4Detected);
    r.Type4Detected.isTypeOf = typeChecker(ResponseCodes.Type4Detected);
    r.Type4Detected.prototype.getPayload = function() {
        var payload = new Uint8Array(1+this.uid.length+this.ats.length);
        payload[0] = this.uid.length;
        payload.set(this.uid,1);
        payload.set(this.ats,1+this.uid.length);

        return payload;
    };
    r.Type4Detected.prototype.parsePayload = function(payload) {
        if(payload.length < 1) {
            throw new Error("Payload must be at least one byte");
        }
        var uidLength = payload[0];
        this.uid = payload.slice(1,1+uidLength);

        if(payload.length > (1+uidLength)) {
            this.ats = payload.slice(1+uidLength);
        } else {
            this.ats = new Uint8Array(0);
        }
    };
    r.Type4Detected.prototype.getUid = function() {
        return this.uid;
    };
    r.Type4Detected.prototype.setUid = function(uid) {
        this.uid = uid;
    };
    r.Type4Detected.prototype.getAts = function() {
        return this.ats;
    };
    r.Type4Detected.prototype.setAts = function(ats) {
        this.ats = ats;
    };

    
    r.Type4PollingError = function() {

    };
    r.Type4PollingError.prototype = AbsProto(ResponseCodes.Type4PollingError);
    r.Type4PollingError.isTypeOf = typeChecker(ResponseCodes.Type4PollingError);
    
    r.Type4Timeout = function() {

    };
    r.Type4Timeout.prototype = AbsProto(ResponseCodes.Type4Timeout);
    r.Type4Timeout.isTypeOf = typeChecker(ResponseCodes.Type4Timeout);

    r.Type4LibraryVersion = function() {
        if(arguments.length < 2) {
            this.majorVersion = 0;
            this.minorVersion = 0;
        } else {
            this.majorVersion = arguments[0];
            this.minorVersion = arguments[1];
        }
    };
    r.Type4LibraryVersion.prototype = AbsProto(ResponseCodes.Type4LibraryVersion);
    r.Type4LibraryVersion.isTypeOf = typeChecker(ResponseCodes.Type4LibraryVersion);
    r.Type4LibraryVersion.prototype.getPayload = function() {
        return new Uint8Array([this.majorVersion,this.minorVersion]);
    };
    r.Type4LibraryVersion.prototype.parsePayload = function(payload) {
        if(payload.length < 2) {
            throw new Error("Type4Library version responses must be at least 2 bytes");
        }
        else {
            this.majorVersion = payload[0];
            this.minorVersion = payload[1];
        }
    };
    r.Type4LibraryVersion.prototype.getMajorVersion = function() {
        return this.majorVersion;
    };
    r.Type4LibraryVersion.prototype.getMinorVersion = function() {
        return this.minorVersion;
    };
    r.Type4LibraryVersion.prototype.setMajorVersion = function(ver) {
        this.majorVersion = ver;
    };
    r.Type4LibraryVersion.prototype.setMinorVersion = function(ver) {
        this.minorVersion = ver;
    };
    
    r.Type4Error = function() {
        if(arguments.length < 3) {
            this.errorCode = 0;
            this.internalErrorCode = 0;
            this.readerStatus = 0;
            this.message = "";
        } else {
            this.errorCode = arguments[0];
            this.internalErrorCode = arguments[1];
            this.readerStatus = arguments[2];
            if(arguments.length > 3) {
                this.message = arguments[3];
            } else {
                this.message = "";
            }
        }
    };
    r.Type4Error.isTypeOf = typeChecker(ResponseCodes.Type4Error);
    r.Type4Error.prototype = AbsProto(ResponseCodes.Type4Error);
    r.Type4Error.prototype.getPayload = function() {
        //convert string to byte array
        var utf8 = unescape(encodeURIComponent(this.message));
        var arr = [];
        for (var i = 0; i < utf8.length; i++) {
            arr.push(utf8.charCodeAt(i));
        }

        var payload = new Uint8Array(3+arr.length);
        payload[0] = this.errorCode;
        payload[1] = this.internalErrorCode;
        payload[2] = this.readerStatus;
        payload.set(arr,3);
        return payload;
    };

    r.Type4Error.prototype.parsePayload = function(payload) {
        if(payload.length < 3) {
            throw new Error("Typer 4 error payload must be at least 3 bytes");
        } else {
            this.errorCode = payload[0];
            this.internalErrorCode = payload[1];
            this.readerStatus = payload[2];

            if(payload.length > 3) {
                this.message = String.fromCharCode.apply(null, payload.slice(3));
            } else {
                this.message = "";
            }
        }
    };
    r.Type4Error.prototype.getErrorCode = function() {
        return this.errorCode;
    };
    r.Type4Error.prototype.getInternalErrorCode = function() {
        return this.internalErrorCode;
    };
    r.Type4Error.prototype.getReaderStatusCode = function() {
        return this.readerStatus;
    };
    r.Type4Error.prototype.getErrorMessage = function() {
        return this.message;
    };
    r.Type4Error.prototype.setErrorCode = function(errorCode) {
        this.errorCode = errorCode;
    };
    r.Type4Error.prototype.setInternalErrorCode = function(errorCode) {
        this.internalErrorCode = errorCode;
    };
    r.Type4Error.prototype.setReaderStatusCode = function(errorCode) {
        this.readerStatus = errorCode;
    };
    r.Type4Error.prototype.setErrorMessage = function(msg) {
        this.message = msg;
    };

    var e = {
        TOO_FEW_PARAMTERS: 0x01,
        TOO_MANY_PARAMETERS: 0x02,
        TRANSCEIVE_ERROR: 0x03,
        INVALID_PARAMETER: 0x04,
        NO_TAG_PRESENT: 0x05,
        NFC_CHIP_ERROR: 0x06,
    };


    var checkCommandValidity = function (cmd) {
        if(typeof cmd !== "object" || cmd === null) {
            throw new Error("Command passed to resolver must be an object implementing: "+cmdMethods.join(", "));
        } else if(!implementsMethods(cmd,cmdMethods)) {
            throw new Error("Error, command passed to resolver must also implement: "+
                    getMissingMethods(cmd,cmdMethods).join(", "));
        } else if(!arrEquals(cmd.getCommandFamily(),commandFamily)){
            return false;
        }
        return true;
    };
    
    var resolver = function() {
    };
    
    resolver.prototype.checkFamily = function(cmd) {
        return checkCommandValidity(cmd);
    };

    resolver.prototype.validate = function(cmd) {
        if(checkCommandValidity(cmd)) {
            return true;
        } else {
            throw new Error("Resolver doesn't support command's family");
        }
    };

    resolver.prototype.resolveCommand = function(cmd) {
        var parsed = null;
        if(this.validate(cmd)) {
            switch(cmd.getCommandCode()) {
                case CommandCodes.TransceiveApdu:
                    parsed = new c.TransceiveApdu();
                    parsed.parsePayload(cmd.getPayload());
                    break;
                case CommandCodes.DetectType4B:
                    parsed = new c.DetectType4B();
                    parsed.parsePayload(cmd.getPayload());
                    break;
                case CommandCodes.DetectType4BSpecificAfi:
                    parsed = new c.DetectType4BSpecificAfi();
                    parsed.parsePayload(cmd.getPayload());
                    break;
                case CommandCodes.DetectType4:
                    parsed = new c.DetectType4();
                    parsed.parsePayload(cmd.getPayload());
                    break;
                case CommandCodes.GetLibraryVersion:
                    parsed = new c.GetLibraryVersion();
                    parsed.parsePayload(cmd.getPayload());
                    break;
            }
        }
        return parsed;
    };

    resolver.prototype.resolveResponse = function(response) {
        var parsed = null;
        if(this.validate(response)) {
            var constructor = null;
            
            switch(response.getCommandCode()) {
                case ResponseCodes.ApduTransceiveSuccessful:
                    constructor = r.ApduTransceiveSuccessful;
                    break;
                case ResponseCodes.Type4BDetected:
                    constructor = r.Type4BDetected;
                    break;
                case ResponseCodes.Type4Detected:
                    constructor = r.Type4Detected;
                    break;
                case ResponseCodes.Type4LibraryVersion:
                    constructor = r.Type4LibraryVersion;
                    break;
                case ResponseCodes.Type4PollingError:
                    constructor = r.Type4PollingError;
                    break;
                case ResponseCodes.Type4Timeout:
                    constructor = r.Type4Timeout;
                    break;
                case ResponseCodes.Type4Error:
                    constructor = r.Type4Error;
                    break;
            }
            
            if(constructor !== null) {
                parsed = new constructor();
                parsed.parsePayload(response.getPayload());
            }
        }

        return parsed;
    };

    return {
        Commands: c,
        Responses: r,
        ErrorCodes: e,
        Resolver: resolver,
        FamilyCode: commandFamily
    };
}));

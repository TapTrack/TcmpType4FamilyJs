var Family = require("../src/type4.js");
var Commands = Family.Commands;
var Responses = Family.Responses;
var Resolver = Family.Resolver;

describe("Test system family parsing",function() {
    
    it("Test commands' familiy codes",function() {
        for(var prop in Commands) {
            expect([].slice.call((new Commands[prop]()).getCommandFamily())).toEqual([0x00,0x04]);
        }
    });

    it("Test responses' family codes",function() {
        for(var prop in Responses) {
            var resp = new Responses[prop]();
            expect([].slice.call(resp.getCommandFamily())).toEqual([0x00,0x04]);
        }
    });
    
    var testCmd = function(constructor, code) {
        var cmd = new constructor();
        expect(cmd.getCommandCode()).toEqual(code);
    };

    it("Test Command codes", function() {
       testCmd(Commands.DetectType4B,0x03);
       testCmd(Commands.DetectType4BSpecificAfi,0x04);
       testCmd(Commands.DetectType4,0x01);
       testCmd(Commands.GetLibraryVersion,0xFF);
       testCmd(Commands.TransceiveApdu,0x02);
    });

    it("Test command payloads",function() {
        var cmd = new Commands.DetectType4B(0x04);
        expect([].slice.call(cmd.getPayload())).toEqual([0x04]);
        cmd.parsePayload([0x07]);
        expect(cmd.getTimeout()).toEqual(0x07);
        
        cmd = new Commands.DetectType4BSpecificAfi(0x04,0x08);
        expect([].slice.call(cmd.getPayload())).toEqual([0x04,0x08]);
        cmd.parsePayload([0x07,0x03]);
        expect(cmd.getTimeout()).toEqual(0x07);
        expect(cmd.getAfi()).toEqual(0x03);
        
        cmd = new Commands.DetectType4(0x04);
        expect([].slice.call(cmd.getPayload())).toEqual([0x04]);
        cmd.parsePayload([0x07]);
        expect(cmd.getTimeout()).toEqual(0x07);
        
        cmd = new Commands.TransceiveApdu(new Uint8Array([0x04,0x08,0x07,0x03]));
        expect([].slice.call(cmd.getPayload())).toEqual([0x04,0x08,0x07,0x03]);
        cmd.parsePayload([0x07,0x02,0x08,0x05]);
    });

    it("Test response command codes", function() {
        testCmd(Responses.ApduTransceiveSuccessful,0x02);
        testCmd(Responses.Type4BDetected,0x07);
        testCmd(Responses.Type4Detected,0x01);
        testCmd(Responses.Type4Error,0x7F);
        testCmd(Responses.Type4LibraryVersion,0x05);
        testCmd(Responses.Type4PollingError,0x04);
        testCmd(Responses.Type4Timeout,0x03);
    });

    it("Test response payloads", function() {
        var cmd = null;

        cmd = new Responses.ApduTransceiveSuccessful(new Uint8Array([0x04,0x06,0x08,0x10]));
        expect([].slice.call(cmd.getPayload())).toEqual([0x04,0x06,0x08,0x10]);
        cmd.parsePayload([0x05,0x07,0x09,0x11]);
        expect(cmd.getApdu()).toEqual([0x05,0x07,0x09,0x11]);

        cmd = new Responses.Type4BDetected(new Uint8Array([0x05,0x02,0x01]),new Uint8Array([0x04,0x03]));
        expect([].slice.call(cmd.getPayload())).toEqual([0x03,0x02,0x05,0x02,0x01,0x04,0x03]);
        cmd.parsePayload([0x02,0x04, 0x06,0x07, 0x08,0x09,0x10,0x11]);
        expect(cmd.getAtqb()).toEqual([0x06,0x07]);
        expect(cmd.getAttrib()).toEqual([0x08,0x09,0x10,0x11]);

        cmd = new Responses.Type4Detected(new Uint8Array([0x02,0x08,0x09,0x10]),new Uint8Array([0x11,0x12,0x13]));
        expect([].slice.call(cmd.getPayload())).toEqual([0x04,0x02,0x08,0x09,0x10, 0x11,0x12,0x13]);
        cmd.parsePayload([0x07,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x10]);
        expect(cmd.getUid()).toEqual([0x01,0x02,0x03,0x04,0x05,0x06,0x07]);
        expect(cmd.getAts()).toEqual([0x08,0x09,0x10]);
        
        cmd = new Responses.Type4LibraryVersion(0x4,0x07);
        expect([].slice.call(cmd.getPayload())).toEqual([0x04,0x07]);
        cmd.parsePayload([0x11,0x23]);
        expect(cmd.getMajorVersion()).toEqual(0x11);
        expect(cmd.getMinorVersion()).toEqual(0x23);

        cmd = new Responses.Type4Error(0x03,0x07,0x74,"Test");
        expect([].slice.call(cmd.getPayload())).toEqual([0x03,0x07,0x74,0x54,0x65,0x73,0x74]);
        cmd.parsePayload([0x55,0x21,0xF5,0x58]);
        expect(cmd.getErrorCode()).toEqual(0x55);
        expect(cmd.getInternalErrorCode()).toEqual(0x21);
        expect(cmd.getReaderStatusCode()).toEqual(0xF5);
        expect(cmd.getErrorMessage()).toEqual("X");

        // Polling error and Timeout have no playloads 

    });

    it("Test command resolver",function(){
        var resolver = new Resolver();
        var resolved = null;
        
        var falsioso = function(object) {
            this.getCommandCode = function() {
                return object.getCommandCode();
            };

            this.getCommandFamily = function() {
                return object.getCommandFamily();
            };

            this.getPayload = function() {
                return object.getPayload();
            };
        };
        
        var basicCheck = function(obj,reser,name) {
            var facade = new falsioso(obj);
            var res = reser(facade);
            expect(res).not.toEqual(null,name);
            expect(typeof res).toBe("object",name);
            expect(res.getCommandCode()).toEqual(obj.getCommandCode());
            expect(res.getCommandFamily()).toEqual(obj.getCommandFamily());
            expect(res.getPayload()).toEqual(obj.getPayload());
        };

        var cmdReser = function(obj) {
            return resolver.resolveCommand(obj);
        };

        var resReser = function(obj) {
            return resolver.resolveResponse(obj);
        };

        for(var cKey in Commands) {
            basicCheck(new Commands[cKey](),cmdReser,cKey);
        }
        
        for(var rKey in Responses) {
            basicCheck(new Responses[rKey](),resReser,rKey);
        }
    });
});

describe("Test typeof",function() {
    var testType = function(constructor) {
        return function() {
            var testCmd = new constructor();
            expect(constructor.isTypeOf(testCmd)).toBe(true);
        };
    };

    for(var ckey in Commands) {
        it("Command "+ckey+" should pass its own isTypeOf",testType(Commands[ckey]));
    }
    
    for(var rkey in Responses) {
        it("Response "+rkey+" should pass its own isTypeOf",testType(Responses[rkey]));
    }
});

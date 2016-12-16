Tappy Communication Messaging Protocol (TCMP) commany family for
commands and responses that specifically interact with Type 4 tags.

## Installation
Bower
```
bower install tappy-type4family
```

NPM
```
npm install @taptrack/tappy-type4family
```
## Commands
```javascript
var Type4Family = require('tappy-type4family');
var Commands = Type4Family.Commands;

// Send an Application Protocol Data Unit (APDU) 
// to a Type 4 tag
var cmd = new Commands.TransceiveApdu(apdu)

// Request that the Tappy poll for a Type 4 tag using
// Type B modulation
cmd = new Commands.DetectType4B(timeout)

// Request that the Tappy poll for a Type 4 tag using Type B 
// modulation and having a specific Application Family Idefntifer (AFI)
cmd = new Commands.DetectType4BSpecificAfi(timeout, afi)

// Request that the Tappy poll for a Type 4 tag using 
// Type A modulation
cmd = new Commands.DetectType4(timeout)

// Request that the Tappy report the version of the 
// Type 4 family that it supports
cmd = new Commands.GetLibraryVersion()
```
## Responses
Note, you should only manually construct responses as below for testing 
purposes. in practise, please use the resolver described later to convert 
raw tcmp messages received from the tappy into their corresponding concrete
response types with the payloads parsed appropriately.
```javascript
var Type4Family = require('tappy-type4family');
var Responses = Type4Family.Responses;

// the tag was successfully sent an APDU and replied
var apduResp = new Responses.ApduTransceiveSuccessful();
// retrieve the apdu the tag responded with
apduResp.getApdu();

// a type 4b tag was detected
var type4BDetected = new Responses.Type4BDetected();
// get the tag's ATTRIB
type4BDetected.getAttrib();
// get the tag's ATQB
type4BDetected.getAtqb();

// a type 4a tag was detected
var type4Detected = new Responses.Type4Detected();
// get the tag's UID
type4Detected.getUid();
// get the tag's ATS
type4Detected.getAts();

// an error occured when the Tappy was in the process
// of detecting a tag such as when a tag is removed from
// the Tappy's range part way through detection
var type4PollingError = new Responses.Type4PollingError();

// Tag polling finished without any tag being detected
var type4Timeout = new Responses.Type4Timeout();

// the version of the library 
var libVersion = new Responses.Type4LibraryVersion();
libVersion.getMajorVersion();
libVersion.getMinorVersion();

// an error occured executing a command 
var type4Error = new Responses.Type4Error();
// retrieve the command family-specific error code as per Type4Family.ErrorCodes 
type4Error.getErrorCode();
// retrieve the internal-use error code 
type4Error.getInternalErrorCode();
// retrieve the status reported by the Tappy's NFC Controller
type4Error.getReaderStatusCode();
// retrieve the text message describing the error (may be empty string)
type4Error.getErrorMessage();

```

## Resolver
While you can manually resolve raw TCMP messages received from the Tappy using 
getCommandFamily(), getCommandCode(), getPayload(), and parsePayload(), it is 
much more convenient to use the built-in resolvers and isTypeOf().
```javascript
var resolver = new Type4Family.Resolver();

// first check to see if the family matches this can be used to multiplex 
// multiple resolvers from different families
if(resolver.checkFamily(responseMsg) {
    // resolution will throw if the command family doesn't match, so it is
    // advisable to check that first. additionally, resolution will return
    // null if there is no matching command code in the library
    var resolved = resolver.resolveResponse(responseMsg);
    if(Type4Family.Responses.Type4LibraryVersion.isTypeOf(resolved)) {
        console.log("Library version v"+resolved.getMajorVersion()+"."+resolved.getMinorVersion());
    }
}

```

There is a corresponding resolveCommand for commands in case you are storing
commands in a raw form. Note that commands and responses have overlapping 
commandCode space, so keep track of whether the message was sent to the Tappy
or received from it and use the appropriate resolution function.


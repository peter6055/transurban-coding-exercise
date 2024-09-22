/**
 * This is an integration test for the address API
 *
 * IMPORTANT! Please read the following before running the test:
 *   - This integration testing library is under development, it should be aware that the library may not be stable in production project.
 *
 * Notes:
 *   - Please ensure you ONLY test the case require an integrated with AWS environment, since this test is more costly than the unit test. (Leave the business logic to the unit test)
 *   - Please ensure all of your test cases are independent of each other, this test is running in parallel. (e.g. Do not create an address and search for the same address in the same test case)
 *     If you need to have dependent test cases, please use the `next` method to chain the test cases.
 */

import {App} from 'aws-cdk-lib';
import {ExpectedResult, IntegTest} from "@aws-cdk/integ-tests-alpha";
import {TransurbanCodingExerciseStack} from "../../lib/transurban-coding-exercise-stack";
import {BuildState} from "../../types";

const app = new App();
const stack = new TransurbanCodingExerciseStack(app, 'TransurbanCodingExerciseTestStack', {}, BuildState.TEST);

const integ = new IntegTest(app, 'IntegTest', {
    testCases: [stack],
});

/**
 * Provides a brief explanation of the ExpectedResult.objectLike assertion.
 *
 * The assertion succeeds when:
 * - It finds the specified key-value pair within the object (match instead of equal) AND
 * - The element count matches the expected element count in the object array.
 *
 * @example
 * // Actual result
 * const actual = {
 *   status: 200,
 *   body: [....]
 * };
 *
 * // Pass, found status key-value pair in the object
 * ExpectedResult.exact({
 *   status: 200,
 * });
 *
 * @example
 * // Actual result
 * const actual = {
 *   body: [
 *     { address: '123 Line street' },
 *     { address: '789 Line street' },
 *   ]
 * };
 *
 * // Fails because the element count is not equal
 * // Received `!! Too many elements in array (expecting 1, got 4)` error
 * ExpectedResult.exact({
 *   body: [
 *     { address: '123 Line street' }
 *   ]
 * });
 *
 * @example
 * // Actual result
 * const actual = {
 *   id: '123-234-46-456', // Auto-generated id, we don't know the value
 *   address: '123 Line street', // We only know the address
 * };
 *
 * // Pass because it can find the address key-value pair in the object
 * // This allows you to check the object in the array without knowing the object ID.
 * ExpectedResult.exact({
 *   address: '123 Line street',
 * });
 */

// TEST001 - should return 201 when we create an address
integ.assertions.httpApiCall(
    `${stack.apiEndpointOutput}address/create/`,
    {
        method: 'POST',
        body: JSON.stringify({
            userId: '001',
            address: {
                line: '456 Fake St',
                suburb: 'Springfield',
                state: 'QLD',
                postcode: '4000',
            }
        }),
    }
).expect(ExpectedResult.objectLike({
    body: {message: "Address Created!"},
    status: 201,
}));


// TEST002 - should return 404 when we try to find an address that does not exist
integ.assertions.httpApiCall(
    `${stack.apiEndpointOutput}address/find/`,
    {
        method: 'POST',
        body: JSON.stringify({
            userId: '002',
            address: {
                postcode: '6000',
            }
        }),
    }
).expect(ExpectedResult.objectLike({
    body: {message: "Address not found"},
    status: 404,
}));


// TEST003 - should return condoning address(search by userId) when we try to the new added address
integ.assertions.httpApiCall(
    `${stack.apiEndpointOutput}address/create/`,
    {
        method: 'POST',
        body: JSON.stringify({
            userId: '003',
            address: {
                line: '456 Like St',
                suburb: 'Hawthorn East',
                state: 'VIC',
                postcode: '3123',
            }
        }),
    }
).next(
    integ.assertions.httpApiCall(
        `${stack.apiEndpointOutput}address/find/`,
        {
            method: 'POST',
            body: JSON.stringify({
                userId: '003',
            }),
        }
    ).expect(ExpectedResult.objectLike({
        body: [
            {
                userId: '003',
                line: '456 Like St',
                suburb: 'Hawthorn East',
                state: 'VIC',
                postcode: '3123',
            }
        ],
        status: 200,
    }))
);


// TEST004 - should return condoning address(search by postcode + userId) when we try to the new added address
integ.assertions.httpApiCall(
    `${stack.apiEndpointOutput}address/create/`,
    {
        method: 'POST',
        body: JSON.stringify({
            userId: '004',
            address: {
                line: '1161 High St Rd',
                suburb: 'Wantirna South',
                state: 'VIC',
                postcode: '3152',
            }
        }),
    }
).next(
    integ.assertions.httpApiCall(
        `${stack.apiEndpointOutput}address/find/`,
        {
            method: 'POST',
            body: JSON.stringify({
                userId: '004',
                address: {
                    postcode: '3152',
                }
            }),
        }
    ).expect(ExpectedResult.objectLike({
        body: [
            {
                userId: '004',
                line: '1161 High St Rd',
                suburb: 'Wantirna South',
                state: 'VIC',
                postcode: '3152',
            }
        ],
        status: 200,
    }))
);


// TEST005 - should return condoning address(search by suburb + userId) when we try to the new added address
integ.assertions.httpApiCall(
    `${stack.apiEndpointOutput}address/create/`,
    {
        method: 'POST',
        body: JSON.stringify({
            userId: '005',
            address: {
                line: '400 Melbourne Rd',
                suburb: 'Norlane',
                state: 'VIC',
                postcode: '3220',
            }
        }),
    }
).next(
    integ.assertions.httpApiCall(
        `${stack.apiEndpointOutput}address/find/`,
        {
            method: 'POST',
            body: JSON.stringify({
                userId: '005',
                address: {
                    postcode: '3220',
                }
            }),
        }
    ).expect(ExpectedResult.objectLike({
        body: [
            {
                userId: '005',
                line: '400 Melbourne Rd',
                suburb: 'Norlane',
                state: 'VIC',
                postcode: '3220',
            }
        ],
        status: 200,
    }))
);


/**
 *  The following test case is commented out because the assertAtPath is not working as expected.
 *  I believe the usage of assertAtPath of httpApiCall is currently not working as expected.
 *
 *  According to the GtiHub discussion
 *  (https://github.com/aws/aws-cdk/discussions/30325): Some of else face the same issue and the current library of assertAtPath is empty.
 *
 *  The test should be working as expected if we use the ExpectedResult.objectLike assertion.
 *  Therefore, I will keep the code as it is and will update the test case when the library is updated.
 *  Please keep track of the issue in the GitHub discussion.
 *
 */

// TEST006 - should return 3 address belong to user when we try to find the address by userId
// const data = [
//     {
//         userId: '006',
//         address: {
//             line: '607 High St',
//             suburb: 'Thornbury',
//             state: 'VIC',
//             postcode: '3071',
//         }
//     },
//     {
//         userId: '006',
//         address: {
//             line: '39 Darebin Rd',
//             suburb: 'Thornbury',
//             state: 'VIC',
//             postcode: '3071',
//         }
//     },
//     {
//         userId: '006',
//         address: {
//             line: '301 High St',
//             suburb: 'Northcote',
//             state: 'VIC',
//             postcode: '3070',
//         }
//     }, {
//         userId: '0061',
//         address: {
//             line: '216 High St',
//             suburb: 'Northcote',
//             state: 'VIC',
//             postcode: '3070',
//         }
//     }
// ]
//
// const putRequests = data.map((item) => {
//     return {
//         PutRequest: {
//             Item: {
//                 id: {S: `${uuid()}`},
//                 userId: {S: item.userId},
//                 line: {S: item.address.line},
//                 suburb: {S: item.address.suburb},
//                 state: {S: item.address.state},
//                 postcode: {S: item.address.postcode},
//             }
//         }
//     }
// });
//
// integ.assertions.awsApiCall(
//     '@aws-sdk/client-dynamodb',
//     'BatchWriteItemCommand',
//     {
//         RequestItems: {
//             [stack.tableNameOutput]: putRequests,
//         },
//     }
// ).next(
//     integ.assertions.httpApiCall(
//         `${stack.apiEndpointOutput}address/find/`,
//         {
//             method: 'POST',
//             body: JSON.stringify({
//                 userId: '006'
//             }),
//         }
//     ).assertAtPath('body', ExpectedResult.stringLikeRegexp('hello'))
// )
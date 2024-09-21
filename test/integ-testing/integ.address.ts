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
 * - ExpectedResult.objectLike assertion success when:
 *   - The object is `partially` match key-value pair as the expected object AND
 *   - If it is an array, the element count equal to the expected element count
 *
 * - E.g.
 *   - The array [{a: 1, b: 2}, {a: 3, b:4}] is expected to match [{a: 1}, {a: 2}]
 *     because the key-value pair that `partially` match the expected object and the element count is equal
 *
 *   - The array [{a: 1, b: 2}, {a: 3, b:4}] is not expected to match [{a: 1}]
 *     because even though the key-value pair that `partially` match the expected object, the element count is not equal
 *     (there are two objects in the array but only one object in the expected object)
 *
 *
 * - If you received an error like `!! Too many elements in array (expecting 1, got 4)` on the ExpectedResult.objectLike assertion
 *   this means your assertion is failed because the element count is not equal
 *
 * !! Therefore, you can use this assertion to check the object in the array without knowing the object ID !!
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

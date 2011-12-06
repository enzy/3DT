/*
 * Standart bricks definiton
 *
 * Interpreted as array of shape instances
 *
 */

/*
 * Simple: ###
 */
brickType1 = [
    {location: [0, 0, 0]},
    {location: [4, 0, 0]},
    {location: [2, 0, 0]}
];

/*        #
 * Cross ###
 *        #
 */
brickType2 = [
    {location: [0, 0, 0]},
    {location: [4, 0, 0]},
    {location: [2, 0, 2]},
    {location: [2, 0, -2]},
    {location: [2, 0, 0]}
];

/*      ##
 * Wall ##
 */
brickType3 = [
    {location: [0, 0, 0]},
    {location: [2, 0, 0]},
    {location: [0, 2, 0]},
    {location: [2, 2, 0]}
]


/*
 * All brick types cumulated in array
 */
brickTypes = [brickType1, brickType2, brickType3];
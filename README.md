# Swindlestones

_Inspired_ by the simple dice game in Steve Jackson's "Sorcery!"

## Description

TODO

### Game Rules

1. The game starts with an arbitrary amount of players each with an arbitrary (but equal) amount of dice.

1. Each round, players secretly roll their dice.

1. The first player makes a bid about how many dice of a certain value are on the table.

1. The next player can either challenge the previous bid or make a higher bid.

1. If a player challenges, all dice are revealed. If the bid is correct, the challenger loses a die. If the bid is incorrect, the bidder loses a die.

1. The game continues until only one player has dice left.

## Tests

### Client

- cannot see other players' dice
- cannot modify own dice
- cannot modify others' dice
- dice are within valid range
- cannot bid more dice than in play
- cannot bid less than 1 dice
- TODO

### Server

- TODO

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Please see the LICENSE file for more details.

import React, { Component } from 'react';
import styled from 'styled-components';
import { get } from 'lodash';
import { Radar } from 'react-chartjs-2';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import uuid from 'uuid/v4';

import {
	getPokemon,
	getPokemonDetails,
	getBackgroundColor,
	getBorderColor,
	getPokemonColor,
	getFontColor,
} from './utils';

const colors = {
	blue: '#3D7DCA',
	brown: '#7B675B',
	gray: '#DEE4E6',
	green: '#89C893',
	pink: '#F1B2AC',
	purple: '#BD92AF',
	red: '#FF0000',
	white: '#FBFBFC',
	yellow: '#FFDE00',
};

const pokeTypes = {
	poison: colors.purple,
	grass: colors.green,
	fire: colors.red,
	flying: '#fffcff',
	water: colors.blue,
	bug: colors.green,
	normal: '#fffcff',
	ground: colors.brown,
	fairy: colors.pink,
	fighting: colors.brown,
	psychic: colors.pink,
	rock: colors.black,
	steel: colors.gray,
	electric: colors.yellow,
	ice: colors.white,
	ghost: colors.purple,
	dragon: colors.green,
};

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);
	return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
	const sourceClone = Array.from(source);
	const destClone = Array.from(destination);
	const [removed] = sourceClone.splice(droppableSource.index, 1);

	destClone.splice(droppableDestination.index, 0, removed);

	const result = {};
	result[droppableSource.droppableId] = sourceClone;
	result[droppableDestination.droppableId] = destClone;

	return result;
};

const grid = 8;
const getItemStyle = (isDragging, draggableStyle) => ({
	// some basic styles to make the items look a bit nicer
	userSelect: 'none',
	padding: grid * 2,
	margin: `0 0 ${grid}px 0`,
	borderRadius: 5,
	// change background colour if dragging
	background: isDragging ? colors.gray : colors.white,

	// styles we need to apply on draggables
	...draggableStyle,
});

const getListStyle = isDraggingOver => ({
	// background: isDraggingOver && colors.gray,
});

const Header = styled.div`
	background-color: ${colors.blue};
	color: ${colors.white};
	padding: 1em;
	margin-bottom: 2em;
	box-shadow: 0px 2px 3px #efefef;

	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

const Content = styled.div`
	padding: 1em;
`;

const PokemonContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

const ChartContainer = styled.div`
	max-width: 30vw;
`;

const PokemonList = styled.div`
	overflow: auto;
	height: 25em;
	width: 25vw;
	display: flex;
	justify-content: center;
	// border 1px solid #dfdfdf;
`;

const Pokemon = styled.div`
	width: 20vw;
	max-height: 10em;
	box-shadow: 1px 1px 2px #dfdfdf;
	display: flex;
	flex-direction: row;
`;

const AllPokemon = styled.div`
	margin-bottom: 1em;
`;

const Icon = styled.div`
	height: 32px;
	width: 32px;
	border-radius: 50%;
	overflow: hidden;
`;

const IdBadge = styled.div`
	background-color: ${colors.blue};
	max-width: 32px;
	padding-top: 0.05em;
	padding-bottom: 0.05em;
	border-radius: 50%;
	color: white;
`;

const Left = styled.div`
	flex: 1;
	display: flex;
	font-size: 12px;
	flex-direction: column;
	justify-content: center;
	text-align: center;
`;
const Right = styled.div`
	flex: 3;
`;

const Types = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-top: 0.25em;
`;

class App extends Component {
	state = {
		loading: true,
		items: [],
		borderColors: [],
		graphColors: [],
		selected: [],
		pokemon: [],
		pokeImages: [],
		datasets: [],
	};

	componentWillMount() {
		getPokemon('kanto').then(res => {
			const allPokemon = get(res, 'pokemon_entries', []);
			allPokemon.forEach(pokemon => {
				getPokemonDetails(pokemon.entry_number).then(details => {
					this.setState(prev => ({
						pokemon: prev.pokemon.concat(details).sort((a, b) => a.id - b.id),
						loading: details.id === 151 ? false : true,
					}));
				});
			});
		});
	}

	componentDidUpdate() {
		if (
			!this.state.loading &&
			this.state.selected.length !== 0 &&
			this.state.selected.length > this.state.datasets.length
		) {
			// we need to update the dataset to style the pokemon most recently added to the list.
			const mostRecentPokemon = this.state.selected[this.state.selected.length - 1];

			getPokemonColor(mostRecentPokemon.name)
				.then(res => {
					const color = get(res, 'color.name', 'gray');

					if (this.state.selected.length !== this.state.graphColors.length) {
						let result = getBackgroundColor(color);
						let borderResult = getBorderColor(color);

						this.setState(prev => ({
							borderColors: prev.borderColors.concat([borderResult]),
							graphColors: prev.graphColors.concat([result]),
						}));
						console.log(this.state.graphColors);
					}

					const data = this.state.selected.map((pokemon, index) => ({
						label: pokemon.name,
						borderColor: this.state.borderColors[index],
						backgroundColor: this.state.graphColors[index],
						data: pokemon.stats.map(stat => stat.base_stat),
					}));

					this.setState({ datasets: data });
				})
				.catch(err => {
					console.log(err);
				});
		}
	}

	/**
	 * A semi-generic way to handle multiple lists. Matches
	 * the IDs of the droppable container to the names of the
	 * source arrays stored in the state.
	 */
	id2List = {
		droppable: 'pokemon',
		droppable2: 'selected',
	};

	getList = id => this.state[this.id2List[id]];

	onDragEnd = result => {
		const { source, destination } = result;

		// dropped outside the list
		if (!destination) {
			return;
		}

		if (source.droppableId === destination.droppableId) {
			const items = reorder(this.getList(source.droppableId), source.index, destination.index);

			let state = { items };

			if (source.droppableId === 'droppable2') {
				state = { selected: items };
			}

			this.setState(state);
		} else {
			const result = move(
				this.getList(source.droppableId),
				this.getList(destination.droppableId),
				source,
				destination
			);

			this.setState({
				pokemon: result.droppable,
				selected: result.droppable2,
			});
		}
	};

	// Normally you would want to split things out into separate components.
	// But in this example everything is just done in one place for simplicity
	render() {
		return (
			<div>
				<Header>
					<div>Pokemon Compare</div>
					<div>
						<div
							onClick={() => {
								this.setState(prev => ({
									pokemon: prev.pokemon.concat(prev.selected),
									items: [],
									borderColors: [],
									graphColors: [],
									selected: [],
									pokeImages: [],
									datasets: [],
								}));
							}}
						>
							reset
						</div>
					</div>
				</Header>
				{this.state.loading ? (
					<div>loading</div>
				) : (
					<Content>
						<DragDropContext onDragEnd={this.onDragEnd}>
							<PokemonContainer>
								<Droppable droppableId="droppable">
									{(provided, snapshot) => (
										<PokemonList
											ref={provided.innerRef}
											style={getListStyle(snapshot.isDraggingOver)}
										>
											<AllPokemon>
												{this.state.pokemon.map((item, index) => (
													<Draggable key={item.id} draggableId={item.id} index={index}>
														{(provided, snapshot) => (
															<Pokemon
																ref={provided.innerRef}
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																style={getItemStyle(
																	snapshot.isDragging,
																	provided.draggableProps.style
																)}
															>
																<Left>
																	<Icon>
																		<img
																			height={32}
																			width={32}
																			src={get(
																				item,
																				'sprites.front_default',
																				null
																			)}
																			alt={item.name}
																		/>
																	</Icon>
																	<IdBadge>{item.id}</IdBadge>
																</Left>

																<Right>
																	<div>{item.name.toUpperCase()}</div>
																	<Types>
																		{item.types.map(type => {
																			const fontColor = getFontColor(
																				type.type.name
																			);

																			return (
																				<div
																					key={uuid()}
																					style={{
																						padding: '5px 7px',
																						borderRadius: 15,
																						backgroundColor:
																							pokeTypes[type.type.name],
																						color: fontColor,
																					}}
																				>
																					{type.type.name}
																				</div>
																			);
																		})}
																	</Types>
																</Right>
															</Pokemon>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</AllPokemon>
										</PokemonList>
									)}
								</Droppable>
								<ChartContainer>
									<Radar
										height={500}
										width={500}
										data={{
											labels: [
												'speed',
												'special defense',
												'special attack',
												'defense',
												'attack',
												'hp',
											],
											datasets: this.state.datasets,
										}}
										options={{
											legend: {
												position: 'bottom',
											},
											title: {
												display: true,
												text: 'Stats comparison',
											},
											scale: {
												ticks: {
													beginAtZero: true,
												},
											},
										}}
									/>
								</ChartContainer>
								<Droppable droppableId="droppable2">
									{(provided, snapshot) => (
										<PokemonList
											ref={provided.innerRef}
											style={getListStyle(snapshot.isDraggingOver)}
										>
											<AllPokemon>
												{this.state.selected.map((item, index) => (
													<Draggable key={item.id} draggableId={item.id} index={index}>
														{(provided, snapshot) => (
															<Pokemon
																ref={provided.innerRef}
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																style={getItemStyle(
																	snapshot.isDragging,
																	provided.draggableProps.style
																)}
															>
																<Left>
																	<Icon>
																		<img
																			height={32}
																			width={32}
																			src={get(
																				item,
																				'sprites.front_default',
																				null
																			)}
																			alt={item.name}
																		/>
																	</Icon>
																	<IdBadge>{item.id}</IdBadge>
																</Left>

																<Right>
																	<div>{item.name.toUpperCase()}</div>
																	<Types>
																		{item.types.map(type => {
																			const fontColor = getFontColor(
																				type.type.name
																			);
																			return (
																				<div
																					key={uuid()}
																					style={{
																						padding: '5px 7px',
																						borderRadius: 15,
																						color: fontColor,
																						backgroundColor:
																							pokeTypes[type.type.name] ||
																							'black',
																					}}
																				>
																					{type.type.name}
																				</div>
																			);
																		})}
																	</Types>
																</Right>
															</Pokemon>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</AllPokemon>
										</PokemonList>
									)}
								</Droppable>
							</PokemonContainer>
						</DragDropContext>
					</Content>
				)}
			</div>
		);
	}
}

export default App;

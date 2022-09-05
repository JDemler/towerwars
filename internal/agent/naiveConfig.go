package agent

func NaiveAgentConfig() *Config {
	return &Config{
		BuildOrder: []BuildPosition{
			{9, 1},
			{8, 1},
			{7, 1},
			{6, 1},
			{5, 1},
			{4, 1},
			{3, 1},
			{2, 1},
			{1, 1},
			{0, 1},
			{10, 3},
			{9, 3},
			{8, 3},
			{7, 3},
			{6, 3},
			{5, 3},
			{4, 3},
			{3, 3},
			{2, 3},
			{1, 3},
			{9, 5},
			{8, 5},
			{7, 5},
			{6, 5},
			{5, 5},
			{4, 5},
			{3, 5},
			{2, 5},
			{1, 5},
			{0, 5},
			{10, 7},
			{9, 7},
			{8, 7},
			{7, 7},
			{6, 7},
			{5, 7},
			{4, 7},
			{3, 7},
			{2, 7},
			{1, 7},
			{9, 9},
			{8, 9},
			{7, 9},
			{6, 9},
			{5, 9},
			{4, 9},
			{3, 9},
			{2, 9},
			{1, 9},
			{0, 9},
			{10, 11},
			{9, 11},
			{8, 11},
			{7, 11},
			{6, 11},
			{5, 11},
			{4, 11},
			{3, 11},
			{2, 11},
			{1, 11},
		},
		BuildSplit: 0.5,
	}
}

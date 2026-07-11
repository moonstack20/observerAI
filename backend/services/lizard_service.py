import lizard


def run_lizard(file_path):
    try:
        analysis = lizard.analyze_file(file_path)
    except Exception:
        return {"total_functions": 0, "avg_complexity": 0, "functions": []}

    functions = []
    total_complexity = 0

    for func in analysis.function_list:
        functions.append({
            "name": func.name,
            "complexity": func.cyclomatic_complexity,
            "length": func.length,
            "params": len(func.parameters),
        })
        total_complexity += func.cyclomatic_complexity

    avg_complexity = round(total_complexity / len(functions), 1) if functions else 0

    return {
        "total_functions": len(functions),
        "avg_complexity": avg_complexity,
        "total_lines": analysis.nloc,
        "functions": functions,
    }

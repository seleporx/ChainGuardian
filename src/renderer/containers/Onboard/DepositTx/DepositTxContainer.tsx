import React, {Component, ReactElement} from "react";
import {ButtonPrimary, ButtonSecondary} from "../../../components/Button/ButtonStandard";
import {CopyField} from "../../../components/CopyField/CopyField";
import {Dropdown} from "../../../components/Dropdown/Dropdown";
import {connect} from "react-redux";
import {RouteComponentProps} from "react-router";
import {copyToClipboard} from "../../../services/utils/clipboard-utils";
import {bindActionCreators, Dispatch} from "redux";
import {generateDepositAction, verifyDepositAction} from "../../../actions";
import {IRootState} from "../../../reducers";
import {OnBoardingRoutes, Routes} from "../../../constants/routes";
import {networks} from "../../../services/deposit/networks";
import {saveSelectedNetworkAction} from "../../../actions/network";

/**
 * required own props
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IOwnProps extends Pick<RouteComponentProps, "history"> {
}

/**
 * injected by redux
 */
interface IInjectedProps {
    generateDepositTxData: typeof generateDepositAction;
    verifyDeposit: typeof verifyDepositAction;
    saveSelectedNetwork: typeof saveSelectedNetworkAction;
}


export default class DepositTxComponent extends
    Component<IOwnProps & IInjectedProps & Pick<IRootState, "deposit">, {}> {

    public state = {
        selectedNetworkIndex: 0,
    };

    public componentDidMount(): void {
        this.props.generateDepositTxData(networks[this.state.selectedNetworkIndex]);
    }


    public onNetworkChange = (selected: number): void => {
        // Generate transaction data
        this.props.generateDepositTxData(networks[selected]);
        this.props.saveSelectedNetwork(networks[selected].networkName);

        this.setState({
            selectedNetworkIndex: selected
        });
    };

    // TODO Maybe add some loader becase generating transaction data takes some time
    // there is flag in redux "isDepositGenerated"
    public render(): ReactElement {
        const networkOptions = networks.map((contract) => { return contract.networkName; });
        const selectedContract = networks[this.state.selectedNetworkIndex];
        const {txData} = this.props.deposit;

        return (
            <>
                <h1>Deposit transaction</h1>
                <p>Execute this transaction from your ETH1 wallet of choice along with 32 ETH to become validator.</p>
                <div className="deposit-details-container">
                    <Dropdown
                        label="Network"
                        current={this.state.selectedNetworkIndex}
                        onChange={this.onNetworkChange}
                        options={networkOptions} />
                    <CopyField
                        label="Deposit contract"
                        value={selectedContract.contract.address}
                        onCopy={(): void => copyToClipboard(selectedContract.contract.address)} />
                    <CopyField
                        label="Transaction data"
                        value={txData}
                        onCopy={(): void => copyToClipboard(txData)} />
                </div>
                <div className="deposit-action-buttons">
                    <ButtonSecondary
                        buttonId="skip"
                        onClick={this.handleSkip}
                    >
                        SKIP
                    </ButtonSecondary>
                    <ButtonPrimary
                        buttonId="verify"
                        onClick={this.handleVerify}
                    >
                        Verify
                    </ButtonPrimary>
                </div>
            </>
        );
    }

    private handleSkip = (): void => {
        this.props.history.push(Routes.ONBOARD_ROUTE_EVALUATE(OnBoardingRoutes.PASSWORD));
    };

    // TODO there is a flag in redux "isDepositVisible" so component should wait until flag is set to true
    private handleVerify = (): void => {
        const {selectedNetworkIndex} = this.state;
        // FIXME  pass network name from select but find names that ether.js supports
        // You can use any standard network name
        //  - "homestead"
        //  - "rinkeby"
        //  - "ropsten"
        //  - "kovan"
        //  - "goerli"
        this.props.verifyDeposit(networks[selectedNetworkIndex]);
    };
}

const mapStateToProps = (state: IRootState): Pick<IRootState, "deposit"> => ({
    deposit: state.deposit
});

const mapDispatchToProps = (dispatch: Dispatch): IInjectedProps =>
    bindActionCreators(
        {
            generateDepositTxData: generateDepositAction,
            verifyDeposit: verifyDepositAction,
            saveSelectedNetwork: saveSelectedNetworkAction,
        },
        dispatch
    );

export const DepositTxContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(DepositTxComponent);